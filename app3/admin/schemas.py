from datetime import datetime
from pydantic import BaseModel, EmailStr, constr, Field, ConfigDict
from typing import Optional

USERNAME_MIN_LENGTH = 3
PASSWORD_MIN_LENGTH = 8

class UserBase(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    first_name: constr(
        min_length=USERNAME_MIN_LENGTH,
        max_length=50,
        strip_whitespace=True
    ) = Field(..., example="Иван")
    last_name: constr(
        min_length=USERNAME_MIN_LENGTH,
        max_length=50,
        strip_whitespace=True
    ) = Field(..., example="Иванов")
    phone: constr(
        pattern=r"^\+?[1-9]\d{7,14}$",  # Пример: +79991234567
        max_length=20
    ) = Field(..., example="+79991234567")

class UserCreate(UserBase):
    password: constr(
        min_length=PASSWORD_MIN_LENGTH,
        max_length=128,
        strip_whitespace=True
    ) = Field(..., example="strongpassword123")

class UserUpdate(BaseModel):
    first_name: Optional[constr(max_length=50)] = Field(
        None, example="Иван",
        description="Необязательное обновление имени"
    )
    last_name: Optional[constr(max_length=50)] = Field(
        None, example="Иванов",
        description="Необязательное обновление фамилии"
    )
    phone: Optional[constr(
        pattern=r"^\+?[1-9]\d{7,14}$",
        max_length=20
    )] = Field(None, example="+79991234567")

class UserResponse(UserBase):
    id: int = Field(..., example=1)
    image_path: Optional[str] = Field(
        None,
        example="/uploads/users/1/avatar.jpg",
        description="Путь к изображению профиля"
    )
    created_at: datetime = Field(..., example="2023-01-01T00:00:00")
    updated_at: Optional[datetime] = Field(
        None,
        example="2023-01-02T00:00:00",
        description="Дата последнего обновления"
    )
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "email": "user@example.com",
                "first_name": "Иван",
                "last_name": "Иванов",
                "phone": "+79991234567",
                "image_path": "/uploads/users/1/avatar.jpg",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-02T00:00:00"
            }
        }
    )