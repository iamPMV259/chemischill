from sqlalchemy.ext.asyncio import AsyncSession
from database.models import TeacherInquiry, User
from hooks.error import NotFoundError
from .base_singleton import SingletonMeta


TEACHERS = [
    {
        "id": "1",
        "name": "Dr. Nguyễn Văn A",
        "name_en": "Dr. Nguyen Van A",
        "title": "Tiến sĩ Hóa Hữu Cơ",
        "title_en": "Ph.D. in Organic Chemistry",
        "experience_years": 15,
        "students_count": 2500,
        "avatar_url": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop",
        "specialty": "Hóa Hữu Cơ & Phản Ứng",
        "specialty_en": "Organic Chemistry & Reactions",
        "bio": "Chuyên gia hàng đầu về hóa hữu cơ với hơn 15 năm kinh nghiệm giảng dạy và nghiên cứu.",
        "bio_en": "Leading expert in organic chemistry with over 15 years of teaching and research experience.",
        "email": "nguyenvana@chemischill.edu.vn",
        "phone": "+84 901 234 567",
    },
    {
        "id": "2",
        "name": "PGS. Trần Thị B",
        "name_en": "Assoc. Prof. Tran Thi B",
        "title": "Phó Giáo Sư Hóa Lý",
        "title_en": "Associate Professor in Physical Chemistry",
        "experience_years": 20,
        "students_count": 3200,
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
        "specialty": "Nhiệt Động Học & Động Học",
        "specialty_en": "Thermodynamics & Kinetics",
        "bio": "Phó giáo sư với 20 năm kinh nghiệm, chuyên sâu về nhiệt động học và động học hóa học.",
        "bio_en": "Associate Professor with 20 years of experience, specialized in thermodynamics and chemical kinetics.",
        "email": "tranthib@chemischill.edu.vn",
        "phone": "+84 902 345 678",
    },
    {
        "id": "3",
        "name": "TS. Lê Minh C",
        "name_en": "Dr. Le Minh C",
        "title": "Tiến sĩ Hóa Phân Tích",
        "title_en": "Ph.D. in Analytical Chemistry",
        "experience_years": 12,
        "students_count": 1800,
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        "specialty": "Phân Tích Định Lượng",
        "specialty_en": "Quantitative Analysis",
        "bio": "Tiến sĩ trẻ năng động với kinh nghiệm phong phú trong phân tích hóa học định lượng.",
        "bio_en": "Dynamic young doctor with extensive experience in quantitative chemical analysis.",
        "email": "leminhc@chemischill.edu.vn",
        "phone": "+84 903 456 789",
    },
]


class TeachersService(metaclass=SingletonMeta):
    def list_teachers(self) -> list[dict]:
        return TEACHERS

    def get_teacher(self, teacher_id: str) -> dict:
        teacher = next((teacher for teacher in TEACHERS if teacher["id"] == teacher_id), None)
        if not teacher:
            raise NotFoundError("Teacher not found")
        return teacher

    async def create_inquiry(
        self,
        db: AsyncSession,
        teacher_id: str,
        sender_name: str,
        sender_email: str,
        message: str,
        sender_user: User | None = None,
    ) -> dict:
        teacher = self.get_teacher(teacher_id)
        inquiry = TeacherInquiry(
            teacher_id=teacher_id,
            teacher_name=teacher["name"],
            sender_user_id=sender_user.id if sender_user else None,
            sender_name=sender_name,
            sender_email=sender_email,
            message=message,
        )
        db.add(inquiry)
        await db.commit()
        await db.refresh(inquiry)
        return {
            "id": inquiry.id,
            "teacher_id": inquiry.teacher_id,
            "teacher_name": inquiry.teacher_name,
            "sender_name": inquiry.sender_name,
            "sender_email": inquiry.sender_email,
            "message": inquiry.message,
            "created_at": inquiry.created_at,
        }
