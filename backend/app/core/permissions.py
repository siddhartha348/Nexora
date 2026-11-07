"""Load the shared role matrix used by the API and the web app."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


def _permissions_path() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "shared" / "permissions.json"
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("shared/permissions.json was not found")


@lru_cache(maxsize=1)
def load_permissions() -> dict[str, Any]:
    with _permissions_path().open(encoding="utf-8") as handle:
        return json.load(handle)


def role_record(role: str) -> dict[str, Any]:
    roles = load_permissions().get("roles", {})
    record = roles.get(role)
    if not record:
        return {"homeRoute": "/dashboard", "navItems": [], "permissions": []}
    return record


def role_has_permission(role: str, permission: str) -> bool:
    return permission in role_record(role).get("permissions", [])
