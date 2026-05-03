from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # username → websocket

    async def connect(self, username: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[username] = websocket
        print(f"{username} connected. Online users: {list(self.active_connections.keys())}")

    def disconnect(self, username: str):
        self.active_connections.pop(username, None)
        print(f"{username} disconnected.")

    async def send_to_user(self, username: str, message: dict):
        ws = self.active_connections.get(username)
        if ws:
            await ws.send_json(message)

manager = ConnectionManager()