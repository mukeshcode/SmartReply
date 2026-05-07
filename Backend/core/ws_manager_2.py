# Our PhoneBook

# Connection manager : A singleton class(whose object is created only once, and the same object is reused across the entire app) which manages the users persistent connection to the server.

from fastapi import WebSocket 
# WebSocket : A class which represents a users'(browsers, app) connection to the server.
from typing import Dict

# Name it anything(our own class, name it Banana, no problem).
class ConnectionManager: 
    def __init__(self) : 
        self.active_connections: Dict[int, WebSocket] = {}
        # Important ! A dictionary to store user_id  : WebSocketconnection
        # e.g. {1 : ws_connection_1, 2 : ws_connection_2}

    # If a client requests to upgrade from HTTP to Websocket, call this function to accept their request
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
        ws = self.active_connections.get(user_id) 
        #pass the receiver user_id and the message that it has to receive
        if ws : #if the connection is found
            await ws.send_json(message) #send_json would be a function of the websocket to respond something to that user
        # If ws is None, the user is offline.
        # Message is already saved in DB, so they'll see it when they reconnect.

manager = ConnectionManager()

# Note : 
# we cannot afford to create multiple manager, because, we should have all the client<->server connections at one place inside one self.active_connections
# So, this is a singleton class which would be created only once.

