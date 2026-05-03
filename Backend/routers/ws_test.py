from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.ws_manager import manager
router = APIRouter()

@router.websocket("/ws")
# write anything, even "/banana" will work, no problem, "/ws" is just a convention
async def websocket_endpoint(websocket : WebSocket) : # special object that represent the connection itself
    # Who is passing this websocket object? FastAPI itself. When we connect to the route "/ws", FastAPI creates a connection
    await manager.connect(user_id = 1, websocket=websocket)
    # await websocket.accept() # The client sends an HTTP request saying can we upgrade to websocket? We say yes sure, by accept()
    # If we want to reject also, then we can.
    # Before accepting, if we want to,  load the user from db, allocate memory for this connection, log that someone is connecting, check if the server is at max capacity. Do it, because as you accept the upgradation of HTTP to WebSocket, there is a persistent connection between the client and server.
    # the response from the server, that it is agreeing to upgrade.
    # await websocket.close() # close if you don't want to upgrade to websockets
    try : 
        while True : 
            data = await websocket.receive_text() # waits if the client has sent something. Once message arrives, processes it, sends a reply, and then loops back to waiting again.
            # wait for message → got one → reply → wait for message → got one → reply → ...
            await websocket.send_text(f"You said : {data}")
    except WebSocketDisconnect:
        manager.disconnect(user_id=1) 
        print("Client disconnected")

@router.websocket("/ws/{user_id}")
async def ws_endpoint(ws : WebSocket, user_id: int):
    await manager.connect(user_id=user_id, websocket=ws)
    try : 
        while True : 
            data = await ws.receive_text()
            # we can handle incoming messages here too
    except WebSocketDisconnect :   # always catch this or your server will crash on tab close
        manager.disconnect(user_id)