from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from core.ws_manager import manager
from jose import jwt, JWTError
import json

router = APIRouter()



@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user_name: str = Query(...)  # ws://localhost:8000/ws?token=eyJhbG...
):
    # 1. Verify token BEFORE accepting
    # try:
    #     payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    #     username: str = payload.get('username')
    #     if username is None:
    #         await websocket.close(code=1008)  # reject
    #         return
    # except JWTError:
    #     await websocket.close(code=1008)  # reject
    #     return

    # 2. Token is valid, now accept and register connection
    await manager.connect(user_name, websocket)

    try:
        while True:
            # just keep connection alive
            # we don't expect client to send anything here yet
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                receiver = payload.get("receiver_name")
                message = payload.get("message")
                if receiver and message:
                    await manager.send_to_user(
                        receiver, 
                        {
                            "from": user_name,
                            "message": message
                        }, 
                        user_name,
                        websocket)
            except Exception as e:
                print(f"Error forwarding message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(user_name, websocket)