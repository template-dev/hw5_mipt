from fastapi.responses import RedirectResponse
from fastapi import Request
from jose import JWTError, jwt
from app3.admin.models import Users
from app3.admin.auth import SECRET_KEY, ALGORITHM
from app3.database.db import AsyncSessionLocal
from sqlalchemy.future import select

async def get_current_user_or_redirect(request: Request):
    token = request.cookies.get("access_token") or request.headers.get("Authorization")
    
    if token and token.startswith("Bearer "):
        token = token.split(" ")[1]
    
    if not token:
        return RedirectResponse(url="/auth/login")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            return RedirectResponse(url="/auth/login")
    except JWTError:
        return RedirectResponse(url="/auth/login")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Users).where(Users.email == email))
        user = result.scalars().first()
        if not user:
            return RedirectResponse(url="/auth/login")
        return user