from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:

    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, channel_id: int, websocket: WebSocket):
        await websocket.accept()

        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []

        self.active_connections[channel_id].append(websocket)

    def disconnect(self, channel_id: int, websocket: WebSocket):
        if channel_id in self.active_connections:
            if websocket in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(websocket)

        if len(self.active_connections[channel_id]) == 0:
            del self.active_connections[channel_id]

    async def broadcast(self, channel_id: int, message: dict):
        if channel_id not in self.active_connections:
            return
        
        disconnected = []

        for connection in self.active_connections[channel_id]:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(channel_id, connection)

manager = ConnectionManager()