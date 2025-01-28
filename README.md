# WHAT's UP

A **real-time chat application** built using the **MERN stack** (MongoDB, Express, React, Node.js) with Docker Compose integration for MongoDB and Mongo Express.

## Features

- **User Authentication**: Register and log in securely.
- **Real-time Messaging**: Chat with other users instantly.
- **Responsive Design**: Fully optimized for desktop and mobile.
- **Dockerized MongoDB**: Simplified database setup using Docker Compose.

---

## Technologies Used

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongo Express for DB management)
- **Real-time Communication**: Socket.IO
- **Containerization**: Docker, Docker Compose

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or later)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/yourusername/mern-chat-app.git
cd mern-chat-app
```

### 2. Set up environment variables:
Create a `.env` file in both the `backend` and `frontend` directories with the required configurations.

#### Example `.env` for `backend`:
```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/mern_chat
JWT_SECRET=your_jwt_secret
```

#### Example `.env` for `frontend`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start Docker containers:
Navigate to the root of the project and run:
```bash
docker-compose up -d
```
This will start the MongoDB and Mongo Express services.

### 4. Install dependencies:

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

### 5. Start the app:

#### Backend:
```bash
cd backend
npm run dev
```

#### Frontend:
```bash
cd frontend
npm start
```

---

## Docker Compose Configuration

Here’s the `docker-compose.yml` file for setting up MongoDB and Mongo Express:

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:5
    container_name: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  
  mongo-express:
    image: mongo-express:latest
    container_name: mongo-express
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongo

volumes:
  mongo_data:
```

---

## Usage

1. **Access the app**:
   - Frontend: Open [http://localhost:3000](http://localhost:3000) in your browser.
   - Backend API: Access API routes at [http://localhost:5000](http://localhost:5000).

2. **MongoDB Management**:
   - Mongo Express: Open [http://localhost:8081](http://localhost:8081) to manage your MongoDB database through a web UI.

---

## Scripts

### Backend
- `npm run dev`: Start the backend server in development mode.

### Frontend
- `npm start`: Start the React development server.

---

## Folder Structure

```
mern-chat-app/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── server.js
├── front
