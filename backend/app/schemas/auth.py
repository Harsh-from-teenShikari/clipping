from pydantic import BaseModel, EmailStr
from typing import Literal

class RegisterBody(BaseModel):
    email: EmailStr
    password: str

class LoginBody(BaseModel):
    email: EmailStr
    password: str
