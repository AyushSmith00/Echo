# Echo

### Realtime Community Chat Platform

Echo is a Discord-inspired realtime chat application where users can create servers, join communities using invite codes, create channels, and chat live with other members.

Built as a fullstack project to practice authentication, database design, REST APIs, permissions, and realtime communication using WebSockets.

---

## Features

- User registration and login
- JWT authentication (access + refresh tokens)
- Create and manage servers
- Invite-code based server joining
- Channel creation and deletion
- Realtime channel messaging using WebSockets
- Role and permission validation
- Logged-in user based message alignment
- PostgreSQL database integration

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT Authentication
- WebSockets

---

## Project Structure

```bash
Echo/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── crud/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   └── requirements.txt
│
└── frontend/
    ├── app/
    ├── components/
    ├── public/
    └── package.json
```

---

## Main Functionalities

### Authentication
- Register and login system
- JWT access token + refresh token flow
- Protected routes using current user authentication

### Server System
- Users can create their own servers
- Users can join servers using invite codes
- Server membership is stored and validated

### Channel System
- Channels belong to servers
- Members can create channels
- Channels can be deleted with proper permissions

### Realtime Chat
- Live messaging inside channels using WebSockets
- Messages are displayed differently for sender vs other users
- Chat UI supports real-time communication flow

---

## Local Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Echo
```

---

## Backend Setup

### 2. Go to backend folder
```bash
cd backend
```

### 3. Create virtual environment
```bash
python -m venv venv
```

### 4. Activate virtual environment

#### Windows
```bash
venv\Scripts\activate
```

#### Mac/Linux
```bash
source venv/bin/activate
```

### 5. Install dependencies
```bash
pip install -r requirements.txt
```

### 6. Configure environment variables
Create a `.env` file inside the backend folder and add:

```env
DATABASE_URL=your_postgresql_database_url
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### 7. Run backend server
```bash
python -m uvicorn app.main:app --reload
```

Backend runs on:
```bash
http://127.0.0.1:8000
```

---

## Frontend Setup

### 8. Go to frontend folder
```bash
cd ../frontend
```

### 9. Install dependencies
```bash
npm install
```

### 10. Run frontend
```bash
npm run dev
```

Frontend runs on:
```bash
http://localhost:3000
```

---

## Future Improvements

- Better UI styling
- Typing indicators
- Online/offline user presence
- Message timestamps formatting
- Edit/delete messages
- File/image sharing
- Deployment for live demo

---

## Status

✅ Core project completed  
🚧 Deployment not added yet

---

## Author

Built by **Ayush**

MIT License

Copyright (c) 2026 Ayush

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
