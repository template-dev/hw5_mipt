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
from sqlalchemy import func
from app.orders.models import Order
from app2.products.models import Product

router = APIRouter()

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/auth/login")
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

@router.get("/auth/register")
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

@router.get("/auth/logout")
async def logout():
    response = RedirectResponse(url="/auth/login", status_code=302)
    response.delete_cookie("access_token")
    return response

async def get_statistics(db: AsyncSession = Depends(get_db)):
    orders_result = await db.execute(select(func.count(Order.id)))
    orders_count = orders_result.scalar()

    orders_result = await db.execute(select(Order.items))
    orders = orders_result.scalars().all()

    total_income = 0
    for order_items in orders:
        for item in order_items:
            total_income += item["price"] * item.get("quantity", 1)

    products_result = await db.execute(select(func.count(Product.id)))
    products_count = products_result.scalar()

    users_result = await db.execute(func.count(user_models.Users.id))
    users_count = users_result.scalar()

    return {
        "orders_count": orders_count,
        "total_income": total_income,
        "products_count": products_count,
        "users_count": users_count
    }

async def get_users_count(db: AsyncSession = Depends(get_db)):
    users_result = await db.execute(func.count(user_models.Users.id))
    users_count = users_result.scalar()

    return {
        "users_count": users_count
    }