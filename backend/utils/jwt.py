from datetime import datetime, timedelta
from jose import jwt, JWTError
from config.settings import Configs

ALGORITHM = "HS256"


def create_access_token(user_id: str, role: str) -> str:
    auth = Configs.auth()
    expire = datetime.utcnow() + timedelta(minutes=auth.access_token_expire_minutes)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        auth.jwt_secret,
        algorithm=ALGORITHM,
    )


def create_refresh_token(user_id: str, role: str) -> str:
    auth = Configs.auth()
    expire = datetime.utcnow() + timedelta(days=auth.refresh_token_expire_days)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        auth.jwt_refresh_secret,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, Configs.auth().jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        from hooks.error import UnauthorizedError
        raise UnauthorizedError("Invalid or expired token")


def decode_refresh_token(token: str) -> dict:
    try:
        return jwt.decode(token, Configs.auth().jwt_refresh_secret, algorithms=[ALGORITHM])
    except JWTError:
        from hooks.error import UnauthorizedError
        raise UnauthorizedError("Refresh token invalid or expired")


def create_password_reset_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=1)
    return jwt.encode(
        {"sub": user_id, "purpose": "password_reset", "exp": expire},
        Configs.auth().jwt_secret,
        algorithm=ALGORITHM,
    )


def decode_password_reset_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, Configs.auth().jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        from hooks.error import UnauthorizedError
        raise UnauthorizedError("Reset token invalid or expired")
    if payload.get("purpose") != "password_reset":
        from hooks.error import UnauthorizedError
        raise UnauthorizedError("Reset token invalid or expired")
    return payload
