import json
from copy import deepcopy
from pathlib import Path

from app.profiles.user_profile import USER_PROFILE


PROFILE_PATH = Path(__file__).resolve().parents[1] / "data" / "user_profile.json"


def get_user_profile() -> dict:
    profile = deepcopy(USER_PROFILE)

    if PROFILE_PATH.exists():
        try:
            with PROFILE_PATH.open("r", encoding="utf-8") as handle:
                stored_profile = json.load(handle)
            profile.update(stored_profile)
        except (json.JSONDecodeError, OSError):
            return profile

    return profile


def save_user_profile(profile: dict) -> dict:
    merged_profile = deepcopy(USER_PROFILE)
    merged_profile.update(profile)

    PROFILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with PROFILE_PATH.open("w", encoding="utf-8") as handle:
        json.dump(merged_profile, handle, indent=2)

    return merged_profile
