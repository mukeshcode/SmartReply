from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from models.user import User
from models.friend_request import FriendRequest
from schemas.friend_request import SendFriendRequestSchema
from routers.auth import get_current_user, get_db

from core.ws_manager import manager  # add this import at top
from sqlalchemy import or_


router = APIRouter(
    prefix='/friends',
    tags=['friends']
)

# ─────────────────────────────────────────
# SEARCH USER
# ─────────────────────────────────────────
@router.get('/search')
async def search_user(
    username: str,  # query param → /friends/search?username=vivek
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    # exclude yourself from results
    users = db.query(User).filter(
        User.username.ilike(f'%{username}%'),       # case-insensitive search
        User.username != current_user['username']   # don't show yourself
    ).all()

    if not users:
        raise HTTPException(status_code=404, detail='No users found')

    return [{'username': u.username, 'emailid': u.emailid} for u in users]


# ─────────────────────────────────────────
# SEND FRIEND REQUEST
# ─────────────────────────────────────────
@router.post('/friend-requests')
async def send_friend_request(
    request: SendFriendRequestSchema,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    sender = current_user['username'] # sender username from jwt
    receiver = request.receiver_username #receiver username from payload

    # 1. Can't send request to yourself
    if sender == receiver:
        raise HTTPException(status_code=400, detail='You cannot send a request to yourself')

    # 2. Check receiver actually exists
    receiver_user = db.query(User).filter(User.username == receiver).first()
    if not receiver_user:
        raise HTTPException(status_code=404, detail='User not found')

    # 3. Check if request already exists
    existing_request = db.query(FriendRequest).filter(
        FriendRequest.sender_username == sender,
        FriendRequest.receiver_username == receiver
    ).first()

    if existing_request:
        if existing_request.status == 'accepted':
            raise HTTPException(status_code=400, detail='You are already friends')
        
        if existing_request.status == 'pending':
            raise HTTPException(status_code=400, detail='Friend request already sent')
        
        if existing_request.status == 'declined':
            raise HTTPException(status_code=400, detail='Friend request was declined earlier')

    # 4. Save to DB
    friend_request = FriendRequest(
        sender_username=sender,
        receiver_username=receiver
    )
    db.add(friend_request)
    db.commit()

    # await manager.send_to_user(receiver, {
    #     "type": "friend_request_received",
    #     "from": sender,
    #     "request_id": friend_request.id
    # })

    return {'msg': f'Friend request sent to {receiver}'}



@router.put('/friend-requests/{request_id}')
async def respond_to_friend_request(
    request_id : int,
    response: str, #accepted and declined
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
): 
    friend_request = db.query(FriendRequest).filter(
        FriendRequest.id == request_id,
        FriendRequest.receiver_username == current_user['username'],  # only receiver can accept
        FriendRequest.status == 'pending'
    ).first()
    
    if not friend_request:
        raise HTTPException(status_code=404, detail='Friend request not found')

    if response == 'accepted' : 
        friend_request.status = response
        db.commit()
        return {'msg': 'Friend request accepted'}
    elif response == 'declined' : 
        friend_request.delete()
        db.commit()
        return {'msg': 'Friend request declined'}
    else : 
       raise HTTPException(status_code=404, detail='Wrong status sent ! Either send "accepted" or "declined"') 
    
@router.get('/fetch_my_friends')
async def fetch_my_friends(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
) : 
    my_friends = db.query(FriendRequest).filter(
        or_(
            FriendRequest.sender_username == current_user['username'],
            FriendRequest.receiver_username == current_user['username']
        ),
        FriendRequest.status == 'accepted'
    ).all()

    print(f"My friends : {my_friends}")

    return my_friends    


# ─────────────────────────────────────────
# GET PENDING REQUESTS (so User2 can see incoming requests)
# ─────────────────────────────────────────
@router.get('/friend-requests/pending')
async def get_pending_requests(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    requests = db.query(FriendRequest).filter(
        FriendRequest.receiver_username == current_user['username'],
        FriendRequest.status == 'pending'
    ).all()

    return [
        {
            'request_id': r.id,
            'from': r.sender_username,
            'created_at': r.created_at
        }
        for r in requests
    ]