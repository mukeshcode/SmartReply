from fastapi import APIRouter, Depends
from typing import Annotated
from models import User
from schemas.user_response import UserResponse
from typing import List

from sqlalchemy.orm import Session
from .auth import get_db, get_current_user

router = APIRouter(
    prefix='/user_actions',
    tags=['user_action']
)

@router.get('/users')
async def fetch_all_users(user: Annotated[dict, Depends(get_current_user)], db : Annotated[Session, Depends(get_db)]) -> List[UserResponse]:
    users = db.query(User).all()
    return users