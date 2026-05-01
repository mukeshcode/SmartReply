from pydantic import BaseModel, Field

class LoginRequest(BaseModel) :
    username:str = Field(description="Username", default=None)
    password:str = Field(description="Password", default=None) 