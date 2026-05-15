import string
import os
from fastapi import Body, Depends, APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Annotated
from database import Base, engine, SessionLocal
from models.user import User
from schemas.user_request import UserRequest
from schemas.login_request import LoginRequest
from sqlalchemy.orm import Session
import models
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError
from utils.blacklisted_jwt import blacklisted_jwts


# hashing the password using bcrypt
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)
    
security = HTTPBearer()

async def get_current_user(
    credentials:Annotated[HTTPAuthorizationCredentials, Depends(security)]  # HTTPAuthorizationCredentials is the type hint
):
    try:
        token = credentials.credentials  # pulls the token out of header "Authorization: Bearer <token>"
        
        if token in blacklisted_jwts : 
            raise HTTPException(status_code=401, detail='User has already logged out !')

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        username: str = payload.get('username')

        if username is None:
            raise HTTPException(status_code=401, detail='Could not validate user')
        return {'username': username}  # this is what the dependent route will receive as 'user'

    except JWTError:
        raise HTTPException(status_code=401, detail='Could not validate user')


async def get_jwt(
    credentials:Annotated[HTTPAuthorizationCredentials, Depends(security)]  # HTTPAuthorizationCredentials is the type hint
) -> str:
    jwt_token = credentials.credentials
    payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get('username')
    return {'jwt_token' : jwt_token, 'username' : username}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()    



@router.post('/signup')
async def user_signup(user:UserRequest, db: Annotated[Session, Depends(get_db)]): 
    hashed_password = bcrypt_context.hash(user.password)

    user1 = User(username=user.username, emailid=user.emailid, password=hashed_password)
    db.add(user1)
    db.commit()
    return user1

# 1. Annotated
# 2. Secret key

SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM = 'HS256'

def create_jwt(username: str, expiration_delta: timedelta) :
    payload = {'username' : username, 'role' : 'admin'} 
    expires = datetime.now(timezone.utc) + expiration_delta
    payload.update({'exp': expires})

    return jwt.encode(payload, SECRET_KEY, ALGORITHM)


@router.post('/login')
async def login(login_request : LoginRequest, db: Annotated[Session, Depends(get_db)]):
    # user_detail = fetch user from db
    # login_request.password verify

    res_user = db.query(User).filter(User.username == login_request.username).first() 

    if not bcrypt_context.verify(login_request.password, res_user.password):
        raise HTTPException(status_code=401, detail="Username or Password not correct")

    bearer_token = create_jwt(res_user.username, timedelta(minutes=30))
    return {'msg' : 'login successfuly', 'token' : bearer_token}



@router.get('/logout')
async def logout(jwt_data: Annotated[str, Depends(get_jwt)]):
    username = jwt_data.get('username')
    token = jwt_data.get('jwt_token')
    print(f"{username} logged out !")
    blacklisted_jwts.add(token)
    return {'msg' : 'Logged out Successfully !'}

