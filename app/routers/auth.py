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

    # Automatically create a CreatorProfile with ID equal to user_id
    profile = CreatorProfile(id=new_user.id, user_id=new_user.id)
    db.add(profile)
    
    # Update user with the creator_id link
    new_user.creator_id = profile.id
    
    db.commit()
    db.refresh(profile)
    db.refresh(new_user)

    token = create_token(
        {"user_id": new_user.id, "role": new_user.role, "creator_id": profile.id}
    )

    return {
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "creator_id": profile.id,
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

    # Ensure the user has a CreatorProfile and is linked
    profile = db.query(CreatorProfile).filter_by(user_id=user.id).first()
    if not profile:
        profile = CreatorProfile(id=user.id, user_id=user.id)
        db.add(profile)
        user.creator_id = profile.id
        db.commit()
        db.refresh(profile)
        db.refresh(user)
    elif not user.creator_id:
        user.creator_id = profile.id
        db.commit()
        db.refresh(user)

    token = create_token(
        {"user_id": user.id, "role": user.role, "creator_id": profile.id}
    )

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "creator_id": profile.id,
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