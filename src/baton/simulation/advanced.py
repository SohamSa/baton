"""Deliberately simplified advanced mechanisms; no physical adapters or diagnoses.

Fault conditions stay here. Policies receive only emitted observations. These
relationships are teaching constructions, not manufacturer specifications.
"""
from __future__ import annotations

OBSERVED_FIELDS = (
    'lot_id', 'assembly_batch_id', 'mounting_torque_nm', 'nvlink_replay_total',
    'board_ripple_mv', 'pcb_strain_microstrain', 'voltage_margin_mv',
    'validation_mismatch_total', 'power_headroom_w', 'clock_scale',
)


def apply_fault(world, fault, step):
    """Return true only for one of the advanced mechanisms handled here."""
    mechanism = fault['mechanism']
    if mechanism not in {'package_link', 'wafer_cohort', 'board_vrm', 'assembly_strain', 'voltage_margin', 'power_capacity'}:
        return False
    strength = fault['severity']
    if mechanism == 'board_vrm':
        if fault['target_id'] not in world.advanced.get('repaired_boards', set()):
            world.advanced.setdefault('board_faults', {})[fault['target_id']] = (strength, fault['onset'])
    elif mechanism == 'power_capacity':
        members = [g for g in world.gpus.values() if g.power_domain_id == fault['target_id']]
        world.advanced.setdefault('capacity', {})[fault['target_id']] = sum(g.profile['tdp_w'] for g in members) * strength
    else:
        members = [g for g in world.gpus.values() if
                   (fault['target_type'] == 'accelerator' and g.gpu_id == fault['target_id']) or
                   (fault['target_type'] == 'wafer_lot' and g.record.get('lot_id') == fault['target_id']) or
                   (fault['target_type'] == 'assembly_batch' and g.record.get('assembly_batch_id') == fault['target_id'])]
        if fault.get('affected_members') is not None:
            members = sorted(members, key=lambda g:g.gpu_id)[:fault['affected_members']]
        for index, gpu in enumerate(members):
            gpu.condition[mechanism] = strength
            if mechanism == 'wafer_cohort' and gpu.functional:
                if strength > .5 or step == fault['onset']:
                    gpu.ecc_sbe += 2
                if strength > .5 and step >= fault['onset'] + 12 + 10 * index:
                    gpu.functional = False
                    gpu.fail_mode = 'fatal_hardware'
    return True


def advance_conditions(world, cfg, step):
    """Update conditions after workload has been assigned, before observations."""
    for gpu in world.gpus.values():
        c = gpu.condition
        domain_scale = world.advanced.get('domain_scales', {}).get(gpu.power_domain_id, 1.)
        clock = c.get('clock_scale', 1.)
        if domain_scale < 1 or clock < 1:
            gpu.util *= domain_scale * clock
        if 'package_link' in c:
            if gpu.functional and gpu.util > .6:
                gpu.nvlink_replay += max(1, int(10 * c['package_link']))
                c['link_drag'] = 1 + 2 * c['package_link']
            else:
                c['link_drag'] = 1.
        if any(k in c for k in ('package_link', 'voltage_margin')) or domain_scale < 1:
            gpu.latency_multiplier = c.get('link_drag', 1.) / (clock * domain_scale)
        if 'assembly_strain' in c:
            # Thermal expansion couples installation strain to workload heat.
            c['strain'] = 100 + 300 * c['assembly_strain'] * max(0., gpu.temp_c - 40) / 20
            if gpu.functional and c['strain'] > 250:
                gpu.ecc_sbe += 1
            if c['strain'] > 380:
                gpu.functional = False
                gpu.fail_mode = 'fatal_hardware'
        if 'voltage_margin' in c:
            c['margin'] = 70 - 140 * c['voltage_margin'] * gpu.util + 80 * (1 - clock)
            c['invalid'] = gpu.functional and c['margin'] < 0
            if c['invalid']:
                c['mismatches'] = c.get('mismatches', 0) + 1
        board = world.advanced.get('board_faults', {}).get(gpu.host_id)
        if board:
            strength, onset = board
            if strength > .5 and step >= onset + 10 and (step - onset) % 8 == 2:
                gpu.functional = False
                gpu.fail_mode = 'recoverable_process'
    for domain, capacity in world.advanced.get('capacity', {}).items():
        members = [g for g in world.gpus.values() if g.power_domain_id == domain]
        demand = sum(g.profile['idle_w'] + g.util * (g.profile['tdp_w'] - g.profile['idle_w']) for g in members)
        trips = world.advanced.setdefault('overload_steps', {})
        trips[domain] = trips.get(domain, 0) + 1 if demand > capacity else 0
        if trips[domain] >= 2:
            for gpu in members:
                gpu.functional = False
                gpu.fail_mode = 'recoverable_process'


def observations(world, gpu, hidden):
    c = gpu.condition
    board = world.advanced.get('board_faults', {}).get(gpu.host_id)
    capacity = world.advanced.get('capacity', {}).get(gpu.power_domain_id)
    members = [g for g in world.gpus.values() if g.power_domain_id == gpu.power_domain_id]
    demand = sum(g.profile['idle_w'] + g.util * (g.profile['tdp_w'] - g.profile['idle_w']) for g in members)
    return {
        'lot_id': gpu.record.get('lot_id'),
        'assembly_batch_id': gpu.record.get('assembly_batch_id'),
        'mounting_torque_nm': gpu.record.get('mounting_torque_nm'),
        'board_ripple_mv': None if hidden or board is None else 40 * board[0],
        'pcb_strain_microstrain': None if hidden else c.get('strain'),
        'voltage_margin_mv': None if hidden else c.get('margin'),
        'validation_mismatch_total': None if hidden or 'voltage_margin' not in c else c.get('mismatches', 0),
        'power_headroom_w': None if hidden or capacity is None else capacity - demand,
        'clock_scale': None if hidden else c.get('clock_scale', 1.) * world.advanced.get('domain_scales', {}).get(gpu.power_domain_id, 1.),
    }


def invalid_job(world, job):
    return any(world.gpus[g].condition.get('invalid', False) for i,g in enumerate(job.rank_gpu) if i not in job.dropped)


def apply_action(world, cfg, job, decision, step):
    """None means the normal engine must handle this action."""
    from baton.simulation.engine import signature, _restart
    from baton.checkpoints import select_restore_checkpoint
    action, scope = decision['action'], decision['scope']
    if action not in {'replace_cohort', 'service_board', 'swap_chip', 'pace_rank', 'pace_domain'}:
        return None
    if action == 'pace_rank':
        gpu = world.gpus.get(scope)
        if gpu is None or gpu.gpu_id not in job.rank_gpu or not gpu.functional:
            return False, 'pacing_target_unavailable'
        if gpu.condition.get('clock_scale', 1.) < 1:
            return False, 'pacing_limit_reached'
        gpu.condition['clock_scale'] = .8
        return True, 'synthetic_clock_reduction_not_hardware_control'
    if action == 'pace_domain':
        if scope not in world.advanced.get('capacity', {}):
            return False, 'capacity_evidence_unavailable'
        if world.advanced.get('domain_scales', {}).get(scope, 1.) < 1:
            return False, 'domain_pacing_limit_reached'
        world.advanced.setdefault('domain_scales', {})[scope] = .7
        return True, 'synthetic_demand_reduction_not_facility_control'
    chosen, _ = select_restore_checkpoint([cp for cp in world.checkpoints if cp['job_id'] == job.job_id], topology_signature=job.topology_signature, allow_reshard=False, storage_reachable=True, decision_step=step)
    if chosen is None or job.checkpoint_left:
        return False, 'intervention_requires_usable_save'
    if action == 'service_board':
        if scope not in world.advanced.get('board_faults', {}):
            return False, 'board_service_evidence_changed'
        world.advanced.setdefault('repaired_boards', set()).add(scope)
        world.advanced['board_faults'].pop(scope)
        for gpu in world.gpus.values():
            if gpu.host_id == scope and gpu.fail_mode == 'recoverable_process':
                gpu.functional, gpu.fail_mode = True, None
        job.progress = chosen['progress']
        job.attempt += 1
        job.recovery_left = cfg.warmup_steps
        return True, 'synthetic_board_service_with_checkpoint_restore'
    if action == 'swap_chip':
        # Deliberately wrong remedy: a new chip goes into the same faulty board.
        affected = [world.gpus[g] for g in job.rank_gpu if world.gpus[g].host_id == scope and not world.gpus[g].functional]
        spares = [g for g in world.gpus.values() if g.spare and not g.occupied and g.functional and not g.quarantined]
        if len(spares) < len(affected) or not affected:
            return False, 'no_compatible_spare'
        if any(old.profile_id != new.profile_id for old,new in zip(affected,spares)):
            return False, 'no_compatible_spare'
        for old,new in zip(affected,spares):
            new.host_id, new.power_domain_id, new.cooling_domain_id = old.host_id, old.power_domain_id, old.cooling_domain_id
            new.rack_id, new.rack_elevation_u = old.rack_id, old.rack_elevation_u
            new.occupied = True
            old.quarantined = True
            job.rank_gpu[job.rank_gpu.index(old.gpu_id)] = new.gpu_id
        job.placement_version += 1
        job.topology_signature = signature(job.rank_gpu,job.dropped)
        job.progress = chosen['progress']
        job.attempt += 1
        job.recovery_left = cfg.warmup_steps
        return True, 'replacement_chip_inherits_unrepaired_board'
    key, value = scope.split(':', 1)
    if key not in {'lot_id','assembly_batch_id'}:
        return False, 'unknown_cohort_scope'
    members = [world.gpus[g] for i,g in enumerate(job.rank_gpu) if i not in job.dropped and world.gpus[g].record.get(key) == value]
    spares = [g for g in world.gpus.values() if g.spare and not g.occupied and g.functional and not g.quarantined]
    if not members or len(spares) < len(members):
        return False, 'cohort_requires_compatible_spares'
    allocations = []
    for old in members:
        new = next((g for g in spares if g.profile_id == old.profile_id), None)
        if new is None:
            return False, 'cohort_requires_compatible_spares'
        spares.remove(new)
        allocations.append((old,new))
    if chosen['progress'] != job.progress:
        return False, 'cohort_requires_current_save_boundary'
    for old,new in allocations:
        old.quarantined = True
        new.occupied = True
        job.rank_gpu[job.rank_gpu.index(old.gpu_id)] = new.gpu_id
    job.placement_version += 1
    job.topology_signature = signature(job.rank_gpu,job.dropped)
    job.attempt += 1
    job.recovery_left = cfg.warmup_steps
    return True, 'coordinated_cohort_replacement_not_lineage_proof'
