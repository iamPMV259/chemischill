import os

import yaml
from dotenv import load_dotenv

from .models import RootConfig

load_dotenv()

_BACKEND_ROOT = os.path.dirname(os.path.dirname(__file__))
_CONFIG_CANDIDATES = (
    os.path.join(_BACKEND_ROOT, "app-config.yaml"),
    os.path.join(_BACKEND_ROOT, "app-config-template.yaml"),
)


def _resolve_config_path() -> str:
    for path in _CONFIG_CANDIDATES:
        if os.path.exists(path):
            return path

    raise FileNotFoundError(
        "No config file found. Expected one of: "
        + ", ".join(_CONFIG_CANDIDATES)
    )


def _expand_vars(obj):
    if isinstance(obj, str):
        return os.path.expandvars(obj)
    if isinstance(obj, dict):
        return {k: _expand_vars(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_expand_vars(i) for i in obj]
    return obj


with open(_resolve_config_path(), "r") as _f:
    _raw = yaml.safe_load(_f)

_expanded = _expand_vars(_raw)
root_config = RootConfig(**_expanded)
