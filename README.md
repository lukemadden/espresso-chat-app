# Espresso Chat App

A modern, real-time chat application built with React, TypeScript, and Socket.IO. This application allows users to create custom chat rooms, join existing rooms, and communicate with other users in real-time.

## Features

- Real-time messaging using Socket.IO
- Custom room creation and joining
- User presence indicators
- Message history persistence within rooms
- Express backend with Socket.IO integration

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd espresso-chat-app
```

2. Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

## Running the Application

1. Start the server:

```bash
cd server
npm run dev
```

The server will start on port 3001.

2. Start the client (in a new terminal):

```bash
cd client
npm start
```

The client will start on port 3000.

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your username and join a room
2. Create a custom room or join an existing one
3. Start chatting with other users in the room
4. Messages are preserved when users leave and rejoin the room

## Project Structure

```
test-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   └── App.tsx        # Main application component
│   └── package.json
│
└── server/                # Express backend
    ├── src/
    │   └── index.ts       # Server entry point
    └── package.json
```
