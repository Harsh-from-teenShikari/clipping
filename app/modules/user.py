from sqlalchemy import Column, Integer, String, DateTime
from app.db import Base
import uuid

def cuid():
    return "cuid_" + uuid.uuid4().hex[:10]

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=cuid)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user")