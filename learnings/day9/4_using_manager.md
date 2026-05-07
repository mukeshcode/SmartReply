
What this code does? 
1. Defines a websocket endpoint, which receives user_id as a query parameter(or pass as path paramter, no problem. Should also pass JWT token for verification of user)

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.connection_manager import manager
router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket : WebSocket, user_id:int) : 
    await manager.connect(user_id, websocket=websocket) # makes entry in the dictionary also, as{user_id : websocket}
    try : 
        while True : 
            data = await websocket.receive_text() #
            json_data = json.loads(data)

            receiver_id = json_data.get('receiver_id')
            msg = json_data.get('msg')

            await manager.send_to_user(receiver_id, msg)
    except WebSocketDisconnect: # always catch this or your server will crash on tab close
        manager.disconnect(user_id) 
        print("Client disconnected")

```

## Flow
 
```
User 1 connects   →  /ws/1  →  manager becomes { 1: ws_1 }
User 2 connects   →  /ws/2  →  manager becomes { 2: ws_2 }
 
User 1 sends: { "receiver_id": 2, "msg": "Hey!" }
    → server receives it on ws_1
    → parses the JSON
    → calls manager.send_to_user(2, "Hey!")
    → manager looks up ws_2
    → pushes "Hey!" to User 2 instantly
 
User 1 closes tab
    → WebSocketDisconnect raised
    → manager.disconnect(1)
    → { 1: ws_1 } removed from active_connections
```
