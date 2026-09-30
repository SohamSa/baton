"""Distinct mechanisms, evidence boundaries, recovery gates and causal outcomes."""
import copy

import pytest

from baton.policies.library import POLICIES
from baton.simulation.engine import ScenarioRun, run_scenario
from baton.simulation.stories import story_config


def run(story, policy):
    return run_scenario(story_config(story), policy)


def test_straggler_remains_alive_and_slows_new_progress_without_heat_fault():
    cfg=story_config('silent_straggler')
    baseline=run_scenario(cfg,'reactive')
    healthy=cfg.model_dump();healthy['scripted_faults']=[]
    from baton.simulation.engine import ScenarioConfig
    normal=run_scenario(ScenarioConfig(**healthy),'reactive')
    assert baseline['metrics']['useful_new'] < normal['metrics']['useful_new']
    assert not baseline['actions']
    assert all(alive for frame in baseline['evaluator']['trace'] for alive in frame['functional'].values())
    target=[r for r in baseline['observations'] if r['entity_id']=='gpu-r0-h0-d0']
    assert all(r['gpu_temp_c'] is not None for r in target)
    assert target[-1]['step_latency_ms'] > 170
    assert max(r['gpu_temp_c'] for r in target) < 70
    improved=run_scenario(cfg,'straggler_aware')
    assert improved['metrics']['useful_new'] > baseline['metrics']['useful_new']
    assert any(a['action_type']=='replace_rank' and a['effect_applied'] for a in improved['actions'])
    assert improved['jobs']['job-0']['rank_gpu'][0].startswith('gpu-spare')
    assert improved['ledger_errors']==[]


def test_straggler_cannot_replace_without_spare_or_usable_checkpoint():
    cfg=story_config('silent_straggler');cfg.spare_count=0
    r=run_scenario(cfg,'straggler_aware')
    assert not any(a['action_type']=='replace_rank' for a in r['actions'])
    cfg=story_config('silent_straggler');cfg.checkpoint_write_steps=100
    r=run_scenario(cfg,'straggler_aware')
    assert not any(a['action_type']=='replace_rank' and a['effect_applied'] for a in r['actions'])


def test_spatial_restriction_heats_upper_positions_and_leaves_other_rack_unchanged():
    cfg=story_config('rack_thermal_shadow');cfg.steps=18
    faulty=run_scenario(cfg,'reactive')
    healthy=copy.deepcopy(cfg);healthy.scripted_faults=[]
    normal=run_scenario(healthy,'reactive')
    observed={r['entity_id']:r for r in faulty['observations'] if r['event_step']==17 and r.get('entity_kind')=='accelerator'}
    reference={r['entity_id']:r for r in normal['observations'] if r['event_step']==17 and r.get('entity_kind')=='accelerator'}
    upper=[r for r in observed.values() if r['rack_id']=='rack-0' and r['rack_elevation_u']>12.5]
    assert len(upper)==4
    assert all(r['cooling_flow_ratio']<0.6 and r['gpu_temp_c']>reference[r['entity_id']]['gpu_temp_c']+8 for r in upper)
    assert all(r['gpu_temp_c']==reference[r['entity_id']]['gpu_temp_c'] for r in observed.values() if r['rack_id']=='rack-1')
    baseline=run('rack_thermal_shadow','reactive');improved=run('rack_thermal_shadow','cooling_aware')
    assert improved['metrics']['useful_new']>baseline['metrics']['useful_new']
    action=next(a for a in improved['actions'] if a['action_type']=='restore_cooling')
    assert action['scope']=='rack-0' and action['effect_applied']
    assert improved['ledger_errors']==[]


def test_failed_qualification_stays_out_and_reactive_reentry_relapses():
    baseline=run('revolving_door','reactive');improved=run('revolving_door','qualification_aware')
    assert sum(a['action_type']=='restart' and a['effect_applied'] for a in baseline['actions'])>1
    result=improved['diagnostics'][0]
    assert result['state']=='failed' and result['stress_error_count']>0
    assert 'gpu-r0-h0-d0' not in improved['jobs']['job-0']['rank_gpu']
    assert improved['metrics']['useful_new']>baseline['metrics']['useful_new']
    assert improved['ledger_errors']==[]


def test_qualification_can_pass_and_failed_candidate_requires_spare():
    cfg=story_config('revolving_door');cfg.scripted_faults[0].severity=0
    passed=run_scenario(cfg,'qualification_aware')
    assert passed['diagnostics'][0]['state']=='passed'
    assert passed['diagnostics'][0]['stress_error_count']==0
    assert passed['jobs']['job-0']['rank_gpu'][0]=='gpu-r0-h0-d0'
    cfg=story_config('revolving_door');cfg.spare_count=0
    blocked=run_scenario(cfg,'qualification_aware')
    assert blocked['diagnostics'][0]['state']=='failed'
    assert blocked['jobs']['job-0']['rank_gpu'][0]=='gpu-r0-h0-d0'
    assert any(a['reason']=='no_compatible_spare' and not a['effect_applied'] for a in blocked['actions'])


@pytest.mark.parametrize('story,policy',[('silent_straggler','straggler_aware'),('rack_thermal_shadow','cooling_aware'),('revolving_door','qualification_aware')])
def test_distinct_policy_decisions_ignore_injected_truth_and_require_manual_approval(story,policy):
    session=ScenarioRun(story_config(story),policy,'manual',[])
    while not session.finished:session.advance()
    result=session.result()
    assert result['status']=='awaiting_approval'
    assert not result['pending_action']['effect_applied']
    snap=copy.deepcopy(session.snap)
    before=POLICIES[policy].choose(snap)
    snap.update(true_cause='invented',repair_unstable=True,latency_multiplier=99)
    assert POLICIES[policy].choose(snap)==before
    assert result['ledger_errors']==[]
