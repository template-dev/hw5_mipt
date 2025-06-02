from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File, Request, Response
from fastapi.responses import JSONResponse
from fastapi import Path as FPath
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
from app2.products import schemas
from app3.admin.file_utils import save_upload_file
import shutil
import os
from pathlib import Path
from typing import Optional
from app3.admin.redirect_middleware import get_current_user_or_redirect
from app3.admin.models import Users

router = APIRouter()

UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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

@router.post("/users")
async def register(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    avatar: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(user_models.Users).where(user_models.Users.email == email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    avatar_path = None
    if avatar:
        from pathlib import Path
        import shutil
        UPLOAD_DIR = Path("uploads/avatars")
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        filename = f"{email}_{avatar.filename}"
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        avatar_path = str(file_path)

    hashed_password = get_password_hash(password)

    new_user = user_models.Users(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        hashed_password=hashed_password,
        image_path=avatar_path
    )

    print(new_user)

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

    total_income = 0
    orders_result = await db.execute(select(Order))
    orders = orders_result.scalars().all()
    
    for order in orders:
        if order.order_items:
            for item in order.order_items:
                total_income += item.get("price", 0) * item.get("quantity", 1)

    products_result = await db.execute(select(func.count(Product.id)))
    products_count = products_result.scalar()

    users_result = await db.execute(select(func.count(user_models.Users.id)))
    users_count = users_result.scalar()

    return {
        "orders_count": orders_count,
        "total_income": total_income,
        "products_count": products_count,
        "users_count": users_count
    }

async def get_orders(db: AsyncSession):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()

async def get_users_count(db: AsyncSession = Depends(get_db)):
    users_result = await db.execute(func.count(user_models.Users.id))
    users_count = users_result.scalar()
    return users_count

async def get_orders_count(equest: Request, db: AsyncSession):
    orders_result = await db.execute(select(func.count(Order.id)))
    orders_count = orders_result.scalar()
    return orders_count

async def enrich_orders_with_items(orders: list[Order], db: AsyncSession):
    enriched_orders = []
    
    for order in orders:
        enriched_items = []
        
        if not order.order_items:
            enriched_orders.append({
                "order": order,
                "items": [],
                "total_price": 0
            })
            continue
        
        for item in order.order_items:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 1)

            if not product_id:
                continue

            result = await db.execute(select(Product).where(Product.id == product_id))
            product = result.scalars().first()

            if product:
                enriched_items.append({
                    "product_id": product_id,
                    "quantity": quantity,
                    "name": product.name,
                    "description": product.description,
                    "image_url": product.image_path if hasattr(product, 'image_url') else None,
                    "price": product.price,
                    "total_price": product.price * quantity
                })

        total_price = sum(item['total_price'] for item in enriched_items)
        enriched_orders.append({
            "order": order,
            "items": enriched_items,
            "total_price": total_price
        })
    
    return enriched_orders

async def get_all_products(db: AsyncSession):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    
    for product in products:
        if product.image_path:
            product.image_url = f"/{product.image_path}"

    return products

async def get_products_count(db: AsyncSession = Depends(get_db)):
    product_result = await db.execute(func.count(Product.id))
    product_count = product_result.scalar()
    return product_count

@router.post("/products", response_model=schemas.Product, status_code=201)
async def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    db_product = Product(
        name=name,
        description=description,
        price=price,
        image_path=image.filename if image else None
    )
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    if db_product.id is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to create product - ID not generated"
        )
    
    if image:
        try:
            image_path = await save_upload_file(image, db_product.id)
            db_product.image_path = image_path
            await db.commit()
            await db.refresh(db_product)
        except Exception as e:
            await db.delete(db_product)
            await db.commit()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save image: {str(e)}"
            )
    
    product_response = schemas.Product.from_orm(db_product)
    if db_product.image_path:
        product_response.image_url = f"/{db_product.image_path}"
    
    return product_response

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user_or_redirect)
):
    # Проверяем существование товара
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден"
        )
    
    # Удаляем изображение, если оно есть
    if product.image_path:
        try:
            image_path = Path("uploads") / product.image_path
            if image_path.exists():
                image_path.unlink()
        except Exception as e:
            print(f"Ошибка при удалении изображения: {e}")
    
    # Удаляем товар из БД
    await db.delete(product)
    await db.commit()
    
    return Response(status_code=status.HTTP_200_OK)

@router.get("/products/{product_id}", response_model=schemas.Product)
async def get_product_by_id(
    product_id: int = FPath(..., title="ID товара"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден"
        )

    product_data = schemas.Product.from_orm(product)
    if product.image_path:
        product_data.image_url = f"/{product.image_path}"

    return product_data

@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    name: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()

    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    product.name = name
    product.description = description
    product.price = price

    if image:
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        image_path = os.path.join(UPLOAD_DIR, image.filename)

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        product.image_path = image_path

    await db.commit()
    return {"message": "Товар обновлен"}