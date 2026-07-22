from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

ROLES = ["CITIZEN", "OFFICER", "ADMIN"]


# ---- Requests ----

class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str) -> str:
        v = v.upper()
        if v not in ROLES:
            raise ValueError(f"role must be one of {ROLES}")
        return v


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
