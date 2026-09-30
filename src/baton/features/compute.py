"""Point-in-time features. Unavailable metrics stay null."""

from __future__ import annotations

import math


def counter_rates(values: list[float | None]) -> list[float]:
    rates: list[float] = []
    prev: float | None = None
    for value in values:
        if value is None:
            prev = None
            continue
        if prev is None:
            prev = value
            continue
        if value < prev:
            rates.append(float(value))
        else:
            rates.append(float(value - prev))
        prev = value
    return rates


def mean_skip_null(values: list[float | None]) -> float | None:
    present = [v for v in values if v is not None]
    if not present:
        return None
    return sum(present) / len(present)


def ewma(values: list[float | None], alpha: float = 0.35) -> float | None:
    current = None
    for value in values:
        if value is None:
            continue
        current = value if current is None else alpha * value + (1 - alpha) * current
    return current


def rolling(values: list[float | None], stat: str, size: int) -> float | None:
    window = values[-size:]
    present = [v for v in window if v is not None]
    if len(present) < 3:
        return None
    if stat == "mean":
        return sum(present) / len(present)
    if stat == "max":
        return max(present)
    if stat == "delta":
        if len(present) < 2:
            return None
        return present[-1] - present[0]
    if stat == "rate":
        rates = counter_rates(window)
        if len(rates) < 1:
            return None
        return sum(rates) / len(rates)
    raise ValueError(stat)


def robust_z(value: float | None, peers: list[float]) -> float | None:
    if value is None or len(peers) < 2:
        return None
    ordered = sorted(peers)
    mid = ordered[len(ordered) // 2]
    deviations = sorted(abs(p - mid) for p in peers)
    mad = deviations[len(deviations) // 2]
    scale = 1.4826 * mad
    if scale < 1e-6:
        return 0.0 if abs(value - mid) < 1e-6 else None
    return (value - mid) / scale


def expected_temperature(power_w: float, coolant_c: float, nominal_r: float) -> float:
    return coolant_c + power_w * nominal_r


def thermal_residual(temp_c: float | None, power_w: float | None, coolant_c: float | None, nominal_r: float) -> float | None:
    if temp_c is None or power_w is None or coolant_c is None:
        return None
    return temp_c - expected_temperature(power_w, coolant_c, nominal_r)


def pearson(xs: list[float], ys: list[float]) -> float | None:
    if len(xs) < 3 or len(xs) != len(ys):
        return None
    mx = sum(xs) / len(xs)
    my = sum(ys) / len(ys)
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    denx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    deny = math.sqrt(sum((y - my) ** 2 for y in ys))
    if denx < 1e-9 or deny < 1e-9:
        return None
    return num / (denx * deny)
