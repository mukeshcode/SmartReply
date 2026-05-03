from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from core.ws_manager import manager
from jose import jwt, JWTError

router = APIRouter()

SECRET_KEY = 'ce77039451ab2cf7539396cb53a5c0e1d42dfcd77e08eb0708e3e5c7a8b7a0cd'
ALGORITHM = 'HS256'

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)  # ws://localhost:8000/ws?token=eyJhbG...
):
    # 1. Verify token BEFORE accepting
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('username')
        if username is None:
            await websocket.close(code=1008)  # reject
            return
    except JWTError:
        await websocket.close(code=1008)  # reject
        return

    # 2. Token is valid, now accept and register connection
    await manager.connect(username, websocket)

    try:
        while True:
            # just keep connection alive
            # we don't expect client to send anything here yet
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(username)