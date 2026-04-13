import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies import get_db, get_optional_user, require_admin
from api.models import TeacherContactRequest
from services.teachers import TeachersService
from hooks.error import BaseAppException
from database.models import User, TeacherInquiry
from sqlalchemy import select

logger = logging.getLogger(__name__)
router = APIRouter(tags=["teachers"])


def _map_exc(e: BaseAppException) -> HTTPException:
    return HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/teachers")
async def list_teachers():
    return {"data": TeachersService().list_teachers()}


@router.get("/teachers/{teacher_id}")
async def get_teacher(teacher_id: str):
    try:
        return TeachersService().get_teacher(teacher_id)
    except BaseAppException as e:
        raise _map_exc(e)


@router.post("/teachers/{teacher_id}/contact", status_code=201)
async def contact_teacher(
    teacher_id: str,
    body: TeacherContactRequest,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await TeachersService().create_inquiry(
            db, teacher_id, body.sender_name, body.sender_email, body.message, current_user
        )
    except BaseAppException as e:
        raise _map_exc(e)


@router.get("/admin/teacher-inquiries")
async def list_teacher_inquiries(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(TeacherInquiry).order_by(TeacherInquiry.created_at.desc()))
    rows = result.scalars().all()
    return {
        "data": [
            {
                "id": row.id,
                "teacher_id": row.teacher_id,
                "teacher_name": row.teacher_name,
                "sender_user_id": row.sender_user_id,
                "sender_name": row.sender_name,
                "sender_email": row.sender_email,
                "message": row.message,
                "created_at": row.created_at,
            }
            for row in rows
        ]
    }
