from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRequest(BaseModel):
    id: Optional[int] = Field()
    username:str = Field(description="enter username", default=None)
    emailid:EmailStr = Field(description="enter emaild", default=None)
    password:str = Field(description="enter password", default=None)  
    
    
    