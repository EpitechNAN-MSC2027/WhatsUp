# WHAT's UP

A **real-time chat application** built using the **MERN stack** (MongoDB, Express, React, Node.js) with Docker Compose integration for MongoDB and Mongo Express.

## Features

- **User Authentication**: Register and log in securely.
- **Real-time Messaging**: Chat with other users instantly.
- **Responsive Design**: Fully optimized for desktop and mobile.
- **Dockerized MongoDB**: Simplified database setup using Docker Compose.

---

## Technologies Used

- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongo Express for DB management)
- **Real-time Communication**: Socket.IO
- **Containerization**: Docker, Docker Compose

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 22)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/yourusername/mern-chat-app.git
cd WhatsUp
```

### 2. Set up environment variables:
Create a `.env` file in both the `backend` and `frontend` directories with the required configurations.

#### Example `.env` for `backend`:
```env
JWT_SECRET=your_jwt_secret
```


### 3. Start Docker containers:
Navigate to the root of the project and run:
```bash
docker-compose up -d mongo mongo-express
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
node app.js
```

#### Frontend:
```bash
cd frontend
npm run dev
```

---

## Docker Compose Configuration

Here’s the `docker-compose.yml` file for setting up MongoDB and Mongo Express:

```yaml
services:
  mongo:
    image: mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    ports:
        - "27017:27017"

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: example
      ME_CONFIG_MONGODB_URL: mongodb://root:example@mongo:27017/
      ME_CONFIG_BASICAUTH: false
```

---

## Usage

1. **Access the app**:
   - Frontend: Open [http://localhost:5173](http://localhost:5173) in your browser.
   - Backend API: Access API routes at [http://localhost:3000](http://localhost:3000).

2. **MongoDB Management**:
   - Mongo Express: Open [http://localhost:8081](http://localhost:8081) to manage your MongoDB database through a web UI.

---

## Scripts

### Backend
- `node app.js`: Start the backend server in development mode.

### Frontend
- `npm run dev`: Start the React development server.

---

## Folder Structure

```
mern-chat-app/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── .env
│   ├── app.js
├── front/
