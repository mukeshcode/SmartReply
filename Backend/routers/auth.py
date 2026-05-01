import string

from fastapi import Body, Depends, APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from database import Base, engine, SessionLocal
from models.user import User
from schemas.user_request import UserRequest
from schemas.login_request import LoginRequest
from sqlalchemy.orm import Session
import models
from passlib.context import CryptContext

from datetime import datetime, timedelta, timezone

from jose import jwt

# hashing the password using bcrypt
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()    


users= []

@router.get('/users')
async def get_all_users():
    sessionLocal =SessionLocal() 
    print(sessionLocal)
    return users

@router.post('/signup')
async def user_signup(user:UserRequest, db:SessionLocal=Depends(get_db)): 
    hashed_password = bcrypt_context.hash(user.password)

    user1 = User(username=user.username, emailid=user.emailid, password=hashed_password)
    db.add(user1)
    db.commit()
    return user1


SECRET_KEY = 'ce77039451ab2cf7539396cb53a5c0e1d42dfcd77e08eb0708e3e5c7a8b7a0cd'   # openssl rand -hex 32
ALGORITHM = 'HS256'

def create_jwt(username: str, expiration_delta: timedelta) :
    payload = {'username' : username, 'role' : 'admin'} 
    expires = datetime.now(timezone.utc) + expiration_delta
    payload.update({'exp': expires})

    return jwt.encode(payload, SECRET_KEY, ALGORITHM)


@router.post('/login')
async def login(login_request : LoginRequest, db:SessionLocal=Depends(get_db)):
    # user_detail = fetch user from db
    # login_request.password verify

    res_user = db.query(User).filter(User.username == login_request.username).first() 

    if not bcrypt_context.verify(login_request.password, res_user.password):
        raise HTTPException(status_code=401, detail="Username or Password not correct")

    bearer_token = create_jwt(res_user.username, timedelta(minutes=30))
    return {'msg' : 'login successfuly', 'token' : bearer_token}



@router.get('/users/{username}')
async def get_user_by_id(username:str): 
    for user in users:
        if user.username ==username:
           return user
        


