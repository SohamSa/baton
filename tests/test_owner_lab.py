"""Owner inputs must change one real world without bypassing recovery gates."""
import copy
import pytest
from baton.policies.library import POLICIES
from baton.simulation.engine import ScenarioRun, config_hash, run_scenario
from baton.simulation.stories import run_story, story_config


@pytest.mark.parametrize('settings', [
    {'seed': 99}, {'spare_count': -1}, {'spare_count': 5}, {'spare_count': True},
    {'spare_count': 1.5}, {'collector_lag_steps': 13}, {'checkpoint_interval': 0},
    {'fault_strength': float('nan')}, {'fault_strength': float('inf')}, {'spare_count': '2'},
])
def test_owner_inputs_reject_unknown_nonfinite_and_out_of_bounds(settings):
    with pytest.raises(ValueError):
        story_config('recovery_crossroads', settings=settings)


def test_warning_strength_is_not_offered_for_an_abrupt_process_failure():
    with pytest.raises(ValueError):
        story_config('abrupt_failure', settings={'fault_strength': .5})


def test_owner_changes_are_isolated_and_comparisons_use_the_same_config():
    baseline = story_config('recovery_crossroads')
    settings = {'spare_count': 0, 'checkpoint_interval': 12, 'collector_lag_steps': 4, 'fault_strength': .2}
    r = run_story('recovery_crossroads', settings=settings)
    cfg = story_config('recovery_crossroads', settings=settings)
    assert cfg.scripted_faults[0].severity == .2
    assert [f.hard_fail for f in cfg.scripted_faults[1:]] == [20, 20]
    assert config_hash(baseline) == config_hash(story_config('recovery_crossroads'))
    assert r['rehearsal']['config_hash'] == r['comparison']['config_hash'] == config_hash(cfg)
    assert r['rehearsal']['effective'] == settings
    assert r['comparison']['exogenous_faults_aligned']
    assert {'observations','logs'}.isdisjoint(r)


def test_combined_world_interrupts_new_save_and_restores_older_verified_save():
    r = run_scenario(story_config('recovery_crossroads'), 'recovery_review')
    failed = next(cp for cp in r['checkpoints'] if cp['state'] == 'failed')
    assert failed['progress'] == 16 and failed['shards_present'] < failed['shards_expected']
    action = next(a for a in r['actions'] if a['action_type'] == 'restart')
    assert action['effect_applied'] and action['reason'] == 'restored_cp-job-0-8-0'
    assert action['step'] > 20
    assert r['metrics']['recomputation'] > 0 and r['metrics']['useful_new'] > 16
    assert r['ledger_errors'] == []


@pytest.mark.parametrize('spares', [0, 1])
def test_two_failures_require_two_spares_without_partial_replacement(spares):
    cfg = story_config('recovery_crossroads', settings={'spare_count': spares})
    session = ScenarioRun(cfg, 'recovery_review', 'automated', [])
    while not session.finished:
        session.advance()
    r = session.result()
    assert any(a['reason'] == 'no_compatible_spare' and not a['effect_applied'] for a in r['actions'])
    assert all(not g.occupied for g in session.world.gpus.values() if g.spare)
    assert r['jobs']['job-0']['rank_gpu'] == ['gpu-r0-h0-d0','gpu-r0-h0-d1','gpu-r0-h1-d0','gpu-r0-h1-d1']
    assert r['metrics']['useful_new'] == 16 and r['ledger_errors'] == []


def test_stale_reports_block_response_even_when_capacity_exists():
    cfg = story_config('recovery_crossroads', settings={'collector_lag_steps': 8})
    r = run_scenario(cfg, 'recovery_review')
    assert not any(a['action_type'] == 'restart' for a in r['actions'])
    assert any('delayed' in a['reason'] for a in r['actions'])
    assert r['metrics']['useful_new'] == 16 and r['ledger_errors'] == []


def test_save_timing_changes_the_collision_not_just_the_display():
    a = run_story('recovery_crossroads')
    b = run_story('recovery_crossroads', settings={'checkpoint_interval': 12})
    assert any(cp['state'] == 'failed' for cp in a['checkpoints'])
    assert not any(cp['state'] == 'failed' for cp in b['checkpoints'])
    assert a['metrics']['recomputation'] != b['metrics']['recomputation']
    assert a['rehearsal']['config_hash'] != b['rehearsal']['config_hash']


def test_approval_replays_original_settings_and_policy_ignores_injected_truth():
    settings = {'spare_count': 2, 'checkpoint_interval': 12, 'collector_lag_steps': 4}
    cfg = story_config('recovery_crossroads', settings=settings)
    session = ScenarioRun(cfg, 'recovery_review', 'manual', [])
    while not session.finished: session.advance()
    r = session.result()
    assert r['status'] == 'awaiting_approval' and not r['pending_action']['effect_applied']
    snap = copy.deepcopy(session.snap)
    before = POLICIES['recovery_review'].choose(snap)
    snap['true_cause'] = 'made_up'; snap['condition'] = {'severity': 999}
    for row in snap['gpus'].values(): row['latent_fault'] = True
    assert POLICIES['recovery_review'].choose(snap) == before
    pending = r['pending_action']
    approved = run_story('recovery_crossroads', mode='manual', settings=settings, approvals=[{'action_id':pending['action_id'], 'decision':'approve', 'precondition_hash':pending['precondition_hash'], 'actor':'test-owner'}])
    assert approved['story']['settings'] == settings
    assert approved['rehearsal']['config_hash'] == config_hash(cfg)
    assert any(a['action_type']=='restart' and a['effect_applied'] for a in approved['actions'])


@pytest.mark.parametrize('lag', range(6))
def test_allowed_delivery_delay_does_not_create_a_pre_failure_restart(lag):
    r = run_scenario(story_config('recovery_crossroads', settings={'collector_lag_steps': lag}), 'recovery_review')
    assert not any(a['action_type']=='restart' and a['step']<20 for a in r['actions'])
    assert r['metrics']['useful_new'] > 16
