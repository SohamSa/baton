"""Small config parser used only so the browser can import the real engine.

The simulation modules are unchanged. This stand-in covers the BaseModel calls
those modules make. The server keeps using the installed Pydantic package.
"""

from __future__ import annotations

import sys
import types
from typing import Union, get_args, get_origin


_MISSING = object()


class FieldInfo:
    def __init__(self, default=_MISSING, default_factory=None):
        self.default = default
        self.default_factory = default_factory


def Field(default=_MISSING, *, default_factory=None, **_kwargs):
    return FieldInfo(default, default_factory)


class ConfigDict(dict):
    def __init__(self, **kwargs):
        super().__init__(kwargs)


def _resolve(cls, annotation):
    if not isinstance(annotation, str):
        return annotation
    module = sys.modules[cls.__module__]
    return eval(annotation, module.__dict__)


def _convert(annotation, value):
    if isinstance(annotation, str):
        return value
    origin = get_origin(annotation)
    if origin in (Union, types.UnionType):
        if value is None and type(None) in get_args(annotation):
            return None
        for option in get_args(annotation):
            if option is type(None):
                continue
            return _convert(option, value)
        return value
    if origin is list:
        inner = get_args(annotation)[0]
        return [_convert(inner, item) for item in value]
    if origin is dict or annotation is dict:
        return dict(value)
    if annotation is float and isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    if annotation is int and isinstance(value, int) and not isinstance(value, bool):
        return int(value)
    if isinstance(annotation, type) and issubclass(annotation, BaseModel):
        if isinstance(value, annotation):
            return value
        return annotation(**value)
    return value


def _dump(value):
    if isinstance(value, BaseModel):
        return value.model_dump()
    if isinstance(value, list):
        return [_dump(item) for item in value]
    if isinstance(value, dict):
        return {key: _dump(item) for key, item in value.items()}
    return value


class BaseModel:
    model_config: dict = {}

    def __init__(self, **data):
        annotations = getattr(self.__class__, "__annotations__", {})
        if self.model_config.get("extra") == "forbid":
            unknown = set(data) - set(annotations)
            if unknown:
                raise ValueError(f"unexpected fields {sorted(unknown)}")
        for name, annotation in annotations.items():
            resolved = _resolve(self.__class__, annotation)
            if name in data:
                setattr(self, name, _convert(resolved, data[name]))
                continue
            marker = getattr(self.__class__, name, _MISSING)
            if isinstance(marker, FieldInfo):
                if marker.default_factory is not None:
                    raw = marker.default_factory()
                elif marker.default is not _MISSING:
                    raw = marker.default
                else:
                    raise ValueError(f"missing field {name}")
            elif marker is not _MISSING:
                raw = marker
            else:
                raise ValueError(f"missing field {name}")
            setattr(self, name, _convert(resolved, raw))

    def model_dump(self, mode: str = "python"):
        del mode
        payload = {}
        for name in getattr(self.__class__, "__annotations__", {}):
            payload[name] = _dump(getattr(self, name))
        return payload
