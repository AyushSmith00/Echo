A Discord-inspired full-stack chat application built using FastAPI and PostgreSQL with a modern frontend interface.

This project demonstrates scalable backend architecture, secure authentication practices, and system design patterns used in modern collaboration platforms.

Features

User registration with secure password hashing

Server (workspace) creation

Automatic membership system

Channel-based chat organization

Full-stack API integration

Clean and scalable architecture

Tech Stack

Backend

FastAPI

PostgreSQL

SQLAlchemy ORM

Passlib (bcrypt hashing)

Pydantic

Frontend

React / Next.js (update if needed)

REST API integration

Architecture Overview

Users can join multiple servers.
Servers can contain multiple channels.

This architecture is similar to platforms such as Discord, Slack, and Microsoft Teams.

Project Structure
app/
 ├── core/          # security & configuration
 ├── crud/          # database operations
 ├── db/            # database setup & session
 ├── models/        # SQLAlchemy models
 ├── routes/        # API endpoints
 ├── schemas/       # request validation
 └── main.py        # application entry point

Setup Instructions
1. Clone the repository
git clone <repo-url>
cd <repo-folder>

2. Create virtual environment

Windows:

python -m venv venv
venv\Scripts\activate


Mac/Linux:

python -m venv venv
source venv/bin/activate

3. Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary passlib[bcrypt] pydantic email-validator

4. Configure PostgreSQL

Create a database and update:

app/db/database.py

DATABASE_URL = "postgresql://user:password@localhost:5432/echo_db"

5. Run the server
python -m uvicorn app.main:app --reload


Open:

http://127.0.0.1:8000/docs

Security

Passwords are hashed using bcrypt. Plain-text passwords are never stored.

API Endpoints

POST /register — register a new user
POST /servers — create a server
POST /channels — create a channel

Upcoming Improvements

Message system

JWT authentication

Real-time messaging

Permissions and roles

Invite system

Author

Ayush
