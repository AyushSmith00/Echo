from app.db.database import SessionLocal

db = SessionLocal()

print("DB connected successfully")

db.close()