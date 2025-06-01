from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app3.database.db import AsyncSessionLocal
from app3.admin import auth
from app3.admin.auth import get_password_hash, verify_password, create_access_token
from app3.admin.auth import models as user_models
from app3.admin.auth import schemas as user_schemas
from sqlalchemy.future import select
from datetime import timedelta
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/me")
async def get_me(user: user_models.Users = Depends(auth.get_current_user)):
    return {"email": user.email, "id": user.id}

@router.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(user_models.Users).where(user_models.Users.email == email))
    user = result.scalars().first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный логин или пароль")

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    response = JSONResponse(content={"success": True})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=False,
        samesite="lax"
    )
    return response

@router.get("/register")
async def register(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(user_models.Users).where(user_models.Users.email == email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    hashed_password = get_password_hash(password)
    new_user = user_models.Users(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        hashed_password=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"msg": "Пользователь успешно зарегистрирован"}

@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/auth/login", status_code=302)
    response.delete_cookie("access_token")
    return response
