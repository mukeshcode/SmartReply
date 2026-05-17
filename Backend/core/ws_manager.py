from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}  


    async def connect(self, username: str, websocket: WebSocket):
        await websocket.accept()
        if not self.active_connections.get(username): 
            self.active_connections[username] = [websocket]
        else :
            self.active_connections.get(username, []).append(websocket)
        
        print(f"{username} connected. Online users: {list(self.active_connections)}")


    def disconnect(self, username: str, websocket: WebSocket):
        ws_list = self.active_connections.get(username, [])
        if websocket in ws_list : 
            ws_list.remove(websocket)
        
        if len(ws_list) == 0 : 
            self.active_connections.pop(username)

        print(f"{username} disconnected, remaining connections : {self.active_connections}")


    async def send_to_user(self, username: str, message: dict, sender_username, sender_ws : WebSocket):
        ws_list = self.active_connections.get(username, [])
        print(self.active_connections)
        dead_connections = []

        for ws in ws_list : 
            try : 
                await ws.send_json(message)
            except :
                print(f"Found a dead_connection: {ws}") 
                dead_connections.append(ws)
                
        for cnx in dead_connections : 
            ws_list.remove(cnx)
        print(f"Receiver : {username}")
        print(f"this is sender username : {sender_username}")
        await self.send_to_me(sender_username, message, sender_ws)


    async def send_to_me(self, username : str, msg: dict, origin_ws : WebSocket) :
        ws_list = self.active_connections.get(username, [])
        print(f"ws_list : {ws_list}")
        for ws in ws_list : 
            if ws != origin_ws : 
                await ws.send_json(msg)
    

manager = ConnectionManager()