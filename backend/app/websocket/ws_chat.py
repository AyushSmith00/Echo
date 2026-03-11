from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import manager

router = APIRouter()

@router.websocket("/ws/channels/{channel_id}")
async def websocket(websocket: WebSocket, channel_id: int):

    await manager.connect(channel_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            await manager.broadcast(channel_id, data)

    except WebSocketDisconnect:
        manager.disconnect(channel_id, websocket)