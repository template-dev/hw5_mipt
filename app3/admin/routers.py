from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app3.database.db import AsyncSessionLocal
from app3.admin import auth
from app3.admin.auth import get_password_hash, verify_password, create_access_token
from app3.admin.auth import models as user_models
from app3.admin.auth import schemas as user_schemas
from sqlalchemy.future import select
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/me")
async def get_me(user: user_models.Users = Depends(auth.get_current_user)):
    return {"email": user.email, "id": user.id}

@router.post("/login")
async def login(
    login: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(user_models.Users).where(user_models.Users.email == login))
    user = result.scalars().first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный логин или пароль")

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token, "token_type": "bearer"}
