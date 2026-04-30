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
from sqlalchemy.orm import Session
import models
from passlib.context import CryptContext





app = FastAPI()
Base.metadata.create_all(bind=engine)
users=[]

# hashing the password using bcrypt
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()    


@app.get('/users')
async def get_all_users():
    sessionLocal =SessionLocal() 
    print(sessionLocal)
    return users

@app.post('/signup')
async def user_signup(user:UserRequest, db:SessionLocal=Depends(get_db)): 
    hashed_password = bcrypt_context.hash(user.password)

    user1 = User(username=user.username, emailid=user.emailid, password=hashed_password)
    db.add(user1)
    db.commit()
    return user
    
        
@app.get('/users/{username}')
async def get_user_by_id(username:str): 
    for user in users:
        if user.username ==username:
           return user
        




