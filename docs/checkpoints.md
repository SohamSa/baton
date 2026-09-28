# Checkpoints

States follow `CHECKPOINT_EDGES`: requested, queued, writing, manifest-complete, verification-pending, verified-usable, failed, corrupted, unavailable, incompatible.

A save is eligible only when it is verified-usable, complete for the expected shard count, compatible with the current membership or an allowed reshard, reachable, and verified at or before the decision step. An in-flight write is not eligible.

Synchronous checkpoint writes occupy the next step. They are overhead inside the wall-time denominator, not free protection. If a requested save fails, restore selection walks back to an older eligible checkpoint. If none exists, recovery reports that it cannot restore.

Manifest fields stand in for model weights, optimizer, scheduler, RNG, data position, and shard metadata. The files are identifiers and checksums, not weight tensors.
