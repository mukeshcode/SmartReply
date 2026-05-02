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





app = FastAPI()
Base.metadata.create_all(bind=engine)
users=[]

# hashing the password using bcrypt
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

@app.get("/")
def test_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"status": "connected", "result": result.scalar()}
    except Exception as e:
        return {"error": str(e)}
    
       
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()    


@app.get('/users')
async def get_all_users():
    sessionLocal =SessionLocal() 
    # print(sessionLocal)
    users=sessionLocal.query(User).all()
    return users

@app.post('/signup')
async def user_signup(user:UserRequest, db:SessionLocal=Depends(get_db)): 
    hashed_password = bcrypt_context.hash(user.password)

    user1 = User(username=user.username, emailid=user.emailid, password=hashed_password)
    db.add(user1)
    db.commit()
    return user
    
        
@app.get('/users/{Username}')
async def get_user_by_id(Username:str): 
    db=SessionLocal()
    try:
        user=db.query(User).filter(User.username==Username).first()
        if not user:
            return {"error": "no user found"}
        return user
    finally:
        db.close()
        




