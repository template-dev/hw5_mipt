from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine, Base, AsyncSessionLocal
from sqlalchemy.future import select
from pathlib import Path
import os
from sqlalchemy.exc import NoResultFound
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app3.admin.redirect_middleware import get_current_user_or_redirect
from app3.admin.models import Users
from fastapi.responses import RedirectResponse
from app3.admin.routers import router as admin_router, get_statistics, get_db, get_users_count, get_orders, get_orders_count, enrich_orders_with_items, get_all_products

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "templates"

app.mount(
    "/static",
    StaticFiles(directory=TEMPLATES_DIR),
    name="static"
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)

app.include_router(admin_router)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup_event():
    await create_tables()
    print("Tables have been created successfully")

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, user: Users = Depends(get_current_user_or_redirect), db: AsyncSession = Depends(get_db)):
    if isinstance(user, RedirectResponse):
        return user
    result = await get_statistics(db)
    current_user = {
        "email": user.email,
        "id": user.id,
        "avatar": getattr(user, "image_path", None),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
    }
    return templates.TemplateResponse("admin/index.html", {
        "request": request,
        "user": user,
        **result,
        **current_user
    })

@app.get("/auth/login", response_class=HTMLResponse)
async def login(request: Request):
    return templates.TemplateResponse("admin/login.html", {"request": request})

@app.get("/users", response_class=HTMLResponse)
async def users(request: Request, user: Users = Depends(get_current_user_or_redirect), db: AsyncSession = Depends(get_db)):
    if isinstance(user, RedirectResponse):
        return user
    
    users_count = await get_users_count(db)
    current_user = {
        "email": user.email,
        "id": user.id,
        "avatar": getattr(user, "image_path", None),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
    }

    result = await db.execute(select(Users))
    users_list = result.scalars().all()

    return templates.TemplateResponse("admin/users.html", {
        "request": request,
        **current_user,
        "users_count": users_count,
        "users_list": users_list
    })

@app.get("/products", response_class=HTMLResponse)
async def products(request: Request, user: Users = Depends(get_current_user_or_redirect), db: AsyncSession = Depends(get_db)):
    if isinstance(user, RedirectResponse):
        return user
    
    current_user = {
        "email": user.email,
        "id": user.id,
        "avatar": getattr(user, "image_path", None),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
    }
    
    products_list = await get_all_products(db)

    return templates.TemplateResponse("admin/products.html", {
        "request": request,
        "products_list": products_list,
        **current_user
    })

@app.get("/profile", response_class=HTMLResponse)
async def profile(request: Request, user: Users = Depends(get_current_user_or_redirect)):
    if isinstance(user, RedirectResponse):
        return user
    
    current_user = {
        "email": user.email,
        "id": user.id,
        "avatar": getattr(user, "image_path", None),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
    }
    
    return templates.TemplateResponse("admin/profile.html", {
        "request": request,
        **current_user
    })

@app.get("/orders", response_class=HTMLResponse)
async def orders(
    request: Request,
    user: Users = Depends(get_current_user_or_redirect),
    db: AsyncSession = Depends(get_db)
):
    if isinstance(user, RedirectResponse):
        return user

    orders_count = await get_orders_count(request, db)
    orders_list = await get_orders(db)

    orders_with_products = await enrich_orders_with_items(orders_list, db)

    return templates.TemplateResponse("admin/orders.html", {
        "request": request,
        "orders_count": orders_count,
        "orders_with_products": orders_with_products,
    })