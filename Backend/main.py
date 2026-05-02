"""
1.Signup (/signup)->post
2.List of users (/users) ->get
3.fetch user (/users/{id}) ->get
4.login (/login)->post
5. logout( /logout)->post
6.update user(/users/{id})->put 
7.delete user (/users/{id})->delete
"""


import string

from fastapi import Body, Depends, FastAPI
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from database import Base, engine, SessionLocal
from models.user import User
from schemas.user_request import UserRequest
from sqlalchemy import create_engine, Column, Integer, String, text
import models
from passlib.context import CryptContext

from routers import auth, user_actions
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],  # or ["*"] for all (not recommended in prod)
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(user_actions.router)
