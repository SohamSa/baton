"""Independent mechanisms, negative outcomes, evidence boundaries and gates."""
import copy
import json
from pathlib import Path

import pytest

from baton.policies.library import POLICIES
from baton.simulation.engine import OBS_KEYS, ScenarioRun, run_scenario, _restart
from baton.simulation.stories import CHALLENGES, STORIES, run_story, story_config

ADVANCED = ['power_cliff','fractured_microbump','wafer_lot_contagion','innocent_chip_dying_board','cold_plate_torque_fracture','silent_subthreshold_cliff']


def test_package_link_errors_slow_an_alive_rank_without_a_thermal_fault():
    cfg=story_config('fractured_microbump')
    r=run_scenario(cfg,'reactive')
    healthy=copy.deepcopy(cfg);healthy.scripted_faults=[]
    normal=run_scenario(healthy,'reactive')
    target=[o for o in r['observations'] if o['entity_id']=='gpu-r0-h0-d1']
    assert target[-1]['nvlink_replay_total']>100
    assert target[-1]['step_latency_ms']>250
    assert all(alive for frame in r['evaluator']['trace'] for alive in frame['functional'].values())
    assert [o['gpu_temp_c'] for o in target]==[o['gpu_temp_c'] for o in normal['observations'] if o['entity_id']=='gpu-r0-h0-d1']
    assert r['metrics']['useful_new']<normal['metrics']['useful_new']


def test_lot_errors_and_failures_are_shared_only_by_scripted_members():
    r=run_scenario(story_config('wafer_lot_contagion'),'reactive')
    a=[o for o in r['observations'] if o.get('lot_id')=='LOT-A']
    b=[o for o in r['observations'] if o.get('lot_id')=='LOT-B']
    assert max(o['ecc_sbe_total'] or 0 for o in a)>0
    assert all(o['ecc_sbe_total']==0 for o in b)
    failed={gpu for frame in r['evaluator']['trace'] for gpu,alive in frame['functional'].items() if not alive}
    assert failed=={'gpu-r0-h0-d0','gpu-r0-h0-d1'}
    healthy=story_config('wafer_lot_contagion');healthy.scripted_faults=[]
    assert not run_scenario(healthy,'cohort_aware')['actions']


def test_wrong_chip_substitution_keeps_the_board_problem():
    wrong=run_scenario(story_config('innocent_chip_dying_board'),'chip_swap')
    assert any(a['reason']=='replacement_chip_inherits_unrepaired_board' and a['effect_applied'] for a in wrong['actions'])
    assert any(not f['functional'].get('gpu-spare-0',True) for f in wrong['evaluator']['trace'])
    right=run_scenario(story_config('innocent_chip_dying_board'),'board_aware')
    assert any(a['action_type']=='service_board' and a['effect_applied'] for a in right['actions'])
    assert right['metrics']['useful_new']>wrong['metrics']['useful_new']


def test_strain_responds_to_heat_and_does_not_implicate_the_other_batch():
    cfg=story_config('cold_plate_torque_fracture')
    r=run_scenario(cfg,'reactive')
    low=copy.deepcopy(cfg);low.workload=[{'start':0,'util':.2,'phase':'light'}]
    cool=run_scenario(low,'reactive')
    high=[o for o in r['observations'] if o['entity_id']=='gpu-r0-h0-d0']
    low_rows=[o for o in cool['observations'] if o['entity_id']=='gpu-r0-h0-d0']
    assert max(o['pcb_strain_microstrain'] or 0 for o in high)>max(o['pcb_strain_microstrain'] or 0 for o in low_rows)
    assert any(not f['functional']['gpu-r0-h0-d0'] for f in r['evaluator']['trace'])
    assert all(o['pcb_strain_microstrain'] is None for o in r['observations'] if o.get('assembly_batch_id')=='BUILD-B')


def test_negative_margin_blocks_invalid_work_and_new_saves():
    cfg=story_config('silent_subthreshold_cliff')
    baseline=run_scenario(cfg,'reactive')
    bad_steps={o['event_step'] for o in baseline['observations'] if o.get('voltage_margin_mv') is not None and o['voltage_margin_mv']<0}
    assert bad_steps
    assert not any(cp['started_step'] in bad_steps for cp in baseline['checkpoints'])
    assert baseline['jobs']['job-0']['state']=='validation_blocked'
    assert any((o.get('validation_mismatch_total') or 0)>0 for o in baseline['observations'])
    paced=run_scenario(cfg,'margin_aware')
    assert paced['metrics']['useful_new']>baseline['metrics']['useful_new']
    severe=copy.deepcopy(cfg);severe.scripted_faults[0].severity=2
    blocked=run_scenario(severe,'margin_aware')
    assert blocked['jobs']['job-0']['state']=='validation_blocked'
    assert any('pacing limit' in a['reason'] for a in blocked['actions'])


def test_domain_capacity_trip_and_demand_reduction():
    cfg=story_config('power_cliff')
    baseline=run_scenario(cfg,'reactive');paced=run_scenario(cfg,'power_aware')
    assert any(o.get('power_headroom_w') is not None and o['power_headroom_w']<0 for o in baseline['observations'])
    assert any(not f['functional']['gpu-r0-h0-d0'] for f in baseline['evaluator']['trace'])
    assert all(f['functional']['gpu-r0-h0-d0'] for f in paced['evaluator']['trace'])
    assert paced['metrics']['useful_new']>baseline['metrics']['useful_new']


@pytest.mark.parametrize('id',['power_cliff','wafer_lot_contagion','cold_plate_torque_fracture','silent_subthreshold_cliff'])
def test_unnecessary_interventions_reduce_useful_progress_in_challenges(id):
    r=run_story(id,variant='challenge')
    assert r['comparison']['delta_second_minus_first']['useful_new']<0
    assert any(a['effect_applied'] for a in r['actions'])


@pytest.mark.parametrize('id',['silent_straggler','rack_thermal_shadow','revolving_door','fractured_microbump','innocent_chip_dying_board'])
def test_absent_capacity_or_stale_evidence_does_not_claim_recovery(id):
    r=run_story(id,variant='challenge')
    assert r['comparison']['delta_second_minus_first']['useful_new']<=0
    assert not any(a['action_type'] in {'replace_rank','restore_cooling','qualified_restart','service_board'} and a['effect_applied'] for a in r['actions'])


@pytest.mark.parametrize('id',ADVANCED)
def test_advanced_manual_gate_observation_contract_and_truth_independence(id):
    cfg=story_config(id);policy=STORIES[id]['primary_policy']
    session=ScenarioRun(cfg,policy,'manual',[])
    while not session.finished:session.advance()
    r=session.result();assert r['status']=='awaiting_approval'
    assert not r['pending_action']['effect_applied']
    snap=copy.deepcopy(session.snap);before=POLICIES[policy].choose(snap)
    for row in snap['gpus'].values():row.update(condition={'board_vrm':99,'invalid':True}, true_cause='made_up',severity=99)
    snap['advanced']={'board_faults':{'host-r0-h0':99}}
    assert POLICIES[policy].choose(snap)==before
    for row in r['observations']:
        assert set(row)<=OBS_KEYS
        assert {'condition','advanced','affected_members','severity','true_cause'}.isdisjoint(row)
    assert r['ledger_errors']==[]
    assert run_scenario(cfg,policy)['ledger_errors']==[]


def test_insufficient_cohort_capacity_has_no_partial_effect():
    cfg=story_config('wafer_lot_contagion');cfg.spare_count=1
    r=run_scenario(cfg,'cohort_aware')
    assert not any(a['action_type']=='replace_cohort' and a['effect_applied'] for a in r['actions'])
    assert r['jobs']['job-0']['rank_gpu']==['gpu-r0-h0-d0','gpu-r0-h0-d1','gpu-r0-h1-d0','gpu-r0-h1-d1']
    session=ScenarioRun(cfg,'reactive','automated',[])
    for _ in range(35):session.advance()
    before=copy.deepcopy(session.world.jobs['job-0'].rank_gpu)
    result=_restart(session.world,cfg,session.world.jobs['job-0'],35,use_spare=True)
    # At this point one spare may have been used; failed recovery must not consume another.
    if not result[0]:assert session.world.jobs['job-0'].rank_gpu==before


def test_variant_validation_and_canonical_assumptions():
    with pytest.raises(ValueError):story_config('gradual_warning','challenge')
    with pytest.raises(ValueError):story_config('power_cliff','invented')
    source=json.loads((Path(__file__).resolve().parents[1]/'content/owner-journey.json').read_text())
    for c in source['characters']:
        cfg=story_config(c['id'])
        for a in c['assumptions']:
            actual=cfg.n_racks*cfg.hosts_per_rack*cfg.gpus_per_host if a['key']=='detailed_ranks' else getattr(cfg,a['key'])
            assert a['value']==actual
            assert a['reason'] and a['unit']
        assert all(c['model'][key] for key in ['relationship','chosen_values','rationale','limits','sensitivity'])
        if c.get('challenge'):assert c['challenge']['parameters']==CHALLENGES[c['id']]
    assert all(set(t['characters'])<=set(STORIES) and t['records'] and t['owner'] for t in source['worksheet']['topics'])
