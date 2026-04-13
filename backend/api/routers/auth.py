import logging
from fastapi import APIRouter, Depends, Response, Cookie, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, get_current_user
from api.models import RegisterRequest, LoginRequest, TokenResponse, RefreshResponse, UserOut, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest
from services.auth import AuthService
from utils.jwt import decode_refresh_token, create_access_token
from config.settings import Configs
from hooks.error import BaseAppException

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


def _cookie_max_age() -> int:
    return Configs.auth().refresh_token_expire_days * 24 * 3600


def _is_production() -> bool:
    return Configs.app().environment == "production"


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        user, access_token, refresh_token = await AuthService().register_user(db, body.username, body.email, body.password)
    except BaseAppException as e:
        raise _map_exc(e)
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, samesite="strict",
        secure=_is_production(),
        max_age=_cookie_max_age(),
    )
    return {"user": UserOut.model_validate(user), "access_token": access_token}


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        user, access_token, refresh_token = await AuthService().login_user(db, body.email, body.password)
    except BaseAppException as e:
        raise _map_exc(e)
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, samesite="strict",
        secure=_is_production(),
        max_age=_cookie_max_age(),
    )
    return {"user": UserOut.model_validate(user), "access_token": access_token}


@router.post("/logout")
async def logout(response: Response, _user=Depends(get_current_user)):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    try:
        payload = decode_refresh_token(refresh_token)
    except BaseAppException as e:
        raise _map_exc(e)
    return {"access_token": create_access_token(payload["sub"], payload["role"])}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await AuthService().request_password_reset(db, body.email)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await AuthService().reset_password(db, body.token, body.new_password)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await AuthService().change_password(db, current_user.id, body.current_password, body.new_password)
    except BaseAppException as e:
        raise _map_exc(e)
