import os
import yaml
from dotenv import load_dotenv
from .models import RootConfig

load_dotenv()

_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app-config.yaml")


def _expand_vars(obj):
    if isinstance(obj, str):
        return os.path.expandvars(obj)
    if isinstance(obj, dict):
        return {k: _expand_vars(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_expand_vars(i) for i in obj]
    return obj


with open(_CONFIG_PATH, "r") as _f:
    _raw = yaml.safe_load(_f)

_expanded = _expand_vars(_raw)
root_config = RootConfig(**_expanded)
