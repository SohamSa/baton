"""Advanced teaching policies use reported evidence, never fault state."""
from baton.policies.library import _decision, ReactivePolicy


class EvidencePolicy:
    name = 'evidence_aware'
    heartbeat_timeout = 2

    def choose(self, snap):
        h = snap['hypotheses']
        if not snap['quality_ok']:
            return _decision('investigate', snap['job_id'], 'Fresh evidence is required before an advanced intervention.', h)
        return self.choose_fresh(snap)

    def save_then(self, snap, action, scope, reason, current=True):
        if snap['eligible_checkpoint_id'] and (not current or snap['checkpoint_age'] == 0):
            return _decision(action, scope, reason, snap['hypotheses'])
        return _decision('request_checkpoint', snap['job_id'], 'Preserve a verified save before the proposed intervention.', snap['hypotheses'])


class LinkPolicy(EvidencePolicy):
    name = 'link_aware'

    def choose_fresh(self, snap):
        for gpu,row in snap['gpus'].items():
            if (row.get('link_replay_delta') or 0) >= 2 and (row.get('step_latency_ratio') or 0) > 1.2 and snap['spare_available']:
                return self.save_then(snap,'replace_rank',gpu,'Observed link retries and latency justify a checkpoint-boundary replacement; microscopic cause remains a hypothesis.')
        return ReactivePolicy().choose(snap)


class CohortPolicy(EvidencePolicy):
    name = 'cohort_aware'

    def choose_fresh(self, snap):
        for row in snap['gpus'].values():
            if row.get('lot_id') and (row.get('ecc_sbe_total') or 0) >= 2:
                return self.save_then(snap,'replace_cohort','lot_id:'+row['lot_id'],'Shared reported lot membership motivates a synthetic cohort intervention, but association does not prove every member defective.')
        return ReactivePolicy().choose(snap)


class StrainPolicy(EvidencePolicy):
    name = 'strain_aware'

    def choose_fresh(self, snap):
        for row in snap['gpus'].values():
            if row.get('assembly_batch_id') and (row.get('pcb_strain_microstrain') or 0) > 250:
                return self.save_then(snap,'replace_cohort','assembly_batch_id:'+row['assembly_batch_id'],'Reported installation strain motivates a batch review and checkpoint-boundary replacement in this synthetic example.')
        return ReactivePolicy().choose(snap)


class BoardPolicy(EvidencePolicy):
    name = 'board_aware'

    def choose_fresh(self, snap):
        for row in snap['gpus'].values():
            if (row.get('board_ripple_mv') or 0) > 20:
                return self.save_then(snap,'service_board',row['host_id'],'Reported shared board ripple supports a synthetic board service and restore, rather than repeatedly replacing chips.',current=False)
        return ReactivePolicy().choose(snap)


class ChipSwapPolicy(EvidencePolicy):
    """Intentional wrong-remedy comparison, not a recommended runbook."""
    name = 'chip_swap'

    def choose_fresh(self, snap):
        if snap['heartbeat_missing_ranks']:
            row=snap['gpus'][snap['rank_gpu'][snap['heartbeat_missing_ranks'][0]]]
            if (row.get('board_ripple_mv') or 0) > 20:
                return self.save_then(snap,'swap_chip',row['host_id'],'Intentional wrong remedy: replace chips on the same unrepaired board.',current=False)
        return ReactivePolicy().choose(snap)


class MarginPolicy(EvidencePolicy):
    name = 'margin_aware'

    def choose_fresh(self, snap):
        for gpu,row in snap['gpus'].items():
            margin=row.get('voltage_margin_mv')
            if margin is not None and margin < 15:
                if row.get('clock_scale',1) < 1:
                    return _decision('investigate',snap['job_id'],'The synthetic pacing limit was reached. Persistent validation errors block useful progress; do not declare recovery.',snap['hypotheses'])
                return _decision('pace_rank',gpu,'Observed low timing margin motivates a synthetic clock reduction with throughput cost.',snap['hypotheses'])
        return ReactivePolicy().choose(snap)


class PowerPolicy(EvidencePolicy):
    name = 'power_aware'

    def choose_fresh(self, snap):
        for row in snap['gpus'].values():
            headroom=row.get('power_headroom_w')
            if headroom is not None and headroom < 80 and row.get('clock_scale',1) == 1:
                return _decision('pace_domain',row['power_domain_id'],'Reported capacity headroom motivates a synthetic demand reduction. It costs throughput and is not a tariff or breaker-control instruction.',snap['hypotheses'])
        return ReactivePolicy().choose(snap)


ADVANCED_POLICIES = {p.name:p() for p in (LinkPolicy,CohortPolicy,StrainPolicy,BoardPolicy,ChipSwapPolicy,MarginPolicy,PowerPolicy)}
