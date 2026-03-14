from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.modules.user import User
from app.schemas.auth import RegisterBody, LoginBody
from app.core.security import hash_password, verify_password, create_token
from app.modules.creator_profile import CreatorProfile

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register")
def register(body: RegisterBody, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == body.email).first()

    if existing:
        raise HTTPException(status_code=409, detail="Email exists")

    new_user = User(
        email=body.email,
        password_hash=hash_password(body.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token(
        {"user_id": new_user.id, "role": new_user.role}
    )

    return {
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
        },
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/login")
def login(body: LoginBody, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == body.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid")

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid")

    token = create_token(
        {"user_id": user.id, "role": user.role}
    )

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        },
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {"id": u.id, "email": u.email, "role": u.role}
        for u in users
    ]