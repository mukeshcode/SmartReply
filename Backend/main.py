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

from fastapi import Body, FastAPI
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
app = FastAPI()

users= []
class Users(BaseModel):
    id: Optional[int] = Field()
    username:str = Field(description="enter username", default=None)
    emailid:EmailStr = Field(description="enter emaild", default=None)
    password:str = Field(description="enter password", default=None)
    
    
    #   title: str = Field(min_length=3)
#     author: str = Field(min_length=1)
#     description: str = Field(min_length=1, max_length=100)
#     rating: int = Field(gt=0, lt=5)   
        
@app.get('/users')
async def get_all_users():
    return users

@app.post('/signup')
async def user_signup(user:Users): 
    user.id=get_last_userId()+1
    
    users.append(user)
    return user
    
@app.get('/users/{username}')
async def get_user_by_id(username:str): 
    for user in users:
        if user.username ==username:
           return user
        
def get_last_userId():
    if users:
        return users[-1].id 
    else:
        return 0
