# Connection manager 
### A singleton class which manages the users persistent connection to the server.

*Singleton class : (whose object is created only once, and the same object is reused across the entire app)*


### Use of this connection manager
1. Holds the {user_id_1 : ws_connection_1, user_id_2 : ws_connection_2}. So, we can store and access multiple ws connections easily. And then we can send messages on that connection(which was our limitation in the previous example)
2. Defines custom functions to connect, disconnect and send_to_user.


```python
from fastapi import WebSocket 
# WebSocket : A class which represents a users'(browsers, app) connection to the server.
from typing import Dict

# Name it anything(our own class, name it Banana, no problem).
class ConnectionManager: 
    def __init__(self) : 
        self.active_connections: Dict[int, WebSocket] = {}
        # Important ! A dictionary to store user_id  : WebSocketconnection
        # e.g. {1 : ws_connection_1, 2 : ws_connection_2}

    async def connect(self, user_id: int, websocket: WebSocket) : 
        # Before accepting, if we want to: 
        # 1. load the user from db
        # 2. allocate memory for this connection
        # 3. log that someone is connecting
        # 4. check if the server is at max capacity. 
        # Do it, because as you accept the upgradation of HTTP to WebSocket, there is a persistent connection between the client and server.
    
        await websocket.accept() # this line is the response from the server, that it is agreeing to upgrade from HTTP to WebSocket

        self.active_connections[user_id] = websocket # Important! and store that object too here.

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None) # Drops the websocket, now the user won't be able to talk on that connection

    async def send_to_user(self, user_id:int, message:dict) : 
        
        ws = self.active_connections.get(user_id) #get the receiver's ws connection, by passing user_id
        if ws : 
            await ws.send_json(message) #send_json to the receiver if connection is found

        # Else, the user is offline.

manager = ConnectionManager()
```

**Note:** 
*1. we cannot afford to create multiple manager, because, we should have all the client<->server connections at one place inside one self.active_connections*
*2.So, this is a singleton class which would be created only once.*


*If the same user logs in from two devices (phone + laptop),
the second login overwrites the first in this dict.
The phone will stop receiving messages.
Production apps store a List of connections per user_id to handle this:
{ 1: [ws_phone, ws_laptop] }
But for SmartReply, one connection per user is perfectly fine.*
