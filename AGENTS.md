# Agent notes

This repository is TrainingContinuity. Do not modify, fork, or push to SohamSa/siliconpulse-ai.

- The backend in `src/training_continuity` is the only decision engine. Do not reimplement simulation or policy in `apps/web`.
- Operator responses must not include latent truth. Evaluator truth is administrator-only and labeled.
- Do not add default currency rates, ROI headlines, or claims about a real company or fleet.
- Do not emit numeric NVIDIA Xid codes. Symptom codes in the simulator are fictional `TC-SYM-*` identifiers.
- Unsupported metrics stay null. Do not coerce them to zero.
- Hardware adapters stay disconnected unless a future, explicit integration exists. No shell or device reset from model output.
- If the trained model does not beat the simpler baseline on held-out decision utility, keep the rule policy as the operational default and record the result.
- Tests must check invariants. Do not assert that a module merely imports.
- Keep `IMPLEMENTATION_STATUS.md` and `NEXT_SESSION.md` aligned with commands that actually ran.
- Do not commit `.env`, `.local/`, `.venv/`, or generated credentials.
