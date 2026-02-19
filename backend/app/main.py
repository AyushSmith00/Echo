from fastapi import FastAPI
from app.db.database import engine, Base
from app.models import user, server, association, channel
from app.routes import server, user, channel

Base.metadata.create_all(bind=engine)


app = FastAPI(title="Echo API")

@app.get("/")
def root():
    return{"message": "Echo backend is running"}

app.include_router(server.router)
app.include_router(user.router)
app.include_router(channel.router)