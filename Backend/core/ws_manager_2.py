from fastapi import WebSocket
from typing import Dict

class ConnectionManager() : 
    def __init__(self) : 
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket) : 
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id:int, message:dict) : 
        ws = self.active_connections.get(user_id)
        if ws :
            await ws.send_json(message)

manager = ConnectionManager()
# Single instance shared across the entire app

# from fastapi import WebSocket # this is going to be the connection between client and server itself
# from typing import Dict

# class ConnectionManager() : 
#     def __init__(self) : 
#         self.active_connections: Dict[int, WebSocket] = {}
#         # a dictionary to store user_id  : connection

#     async def connect(self, user_id: int, websocket: WebSocket) : 
#         await websocket.accept() # accept the connection, if the user 'user1' asks to upgrade a connection from HTTP to WebSocket, then do it.
#         self.active_connections[user_id] = websocket # and store that object too here.

#     def disconnect(self, user_id: int):
#         self.active_connections.pop(user_id, None) # Drops the websocket, now the user won't be able to talk on that connection

#     async def send_to_user(self, user_id:int, message:dict) : 
#         ws = self.active_connections.get(user_id) #pass the receiver user_id and the message that it has to receive
#         if ws : #if the connection is found
#             await ws.send_json(message) #send_json would be a function of the websocket to respond something to that user

# manager = ConnectionManager()
# # we cannot afford to create multiple manager, because, we should have all the client<->server connections at one place. So, this is a singleton class which would be created only once.

