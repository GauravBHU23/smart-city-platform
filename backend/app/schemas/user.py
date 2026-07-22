from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---- Requests ----

class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---- Responses ----

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
