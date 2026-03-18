from fastapi import FastAPI
from app.db.database import engine, Base
from app.models import user, server, server_member, channel,message
from app.routes import server, user, channel, message, auth
from app.websocket import ws_chat
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)


app = FastAPI(title="Echo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return{"message": "Echo backend is running"}

app.include_router(server.router)
app.include_router(user.router)
app.include_router(channel.router)
app.include_router(message.router)
app.include_router(auth.router)
app.include_router(ws_chat.router)
