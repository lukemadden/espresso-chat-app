import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface User {
  id: string;
  username: string;
  room: string;
  originalUsername: string;
}

interface Room {
  name: string;
  users: User[];
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: number;
  originalUsername: string;
  userId: string;
}

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const users: User[] = [];
const rooms: Record<string, Room> = {
  general: {
    name: 'general',
    users: [],
    messages: [],
  },
};

// Get all rooms
app.get('/api/rooms', (req, res) => {
  const roomList = Object.keys(rooms).map((room) => ({
    name: room,
    userCount: rooms[room].users.length,
  }));
  res.json(roomList);
});

io.on('connection', (socket) => {
  console.log('socket: ', socket);
  console.log('New client connected:', socket.id);

  // User joins with username and room
  socket.on(
    'join',
    ({ username, room }: { username: string; room: string }) => {
      // Create room if it doesn't exist
      if (!rooms[room]) {
        rooms[room] = {
          name: room,
          users: [],
          messages: [],
        };
      }

      // Check if user with same username exists in the room
      const existingUserIndex = rooms[room].users.findIndex(
        (user) => user.username === username
      );
      const existingUserGlobalIndex = users.findIndex(
        (user) => user.username === username
      );

      if (existingUserIndex !== -1) {
        // Update existing user's socket ID and username
        const previousUsername = rooms[room].users[existingUserIndex].username;
        rooms[room].users[existingUserIndex].id = socket.id;
        rooms[room].users[existingUserIndex].username = username;
        if (existingUserGlobalIndex !== -1) {
          users[existingUserGlobalIndex].id = socket.id;
          users[existingUserGlobalIndex].username = username;
        }

        // Update username for all messages from this user
        if (previousUsername !== username) {
          rooms[room].messages = rooms[room].messages.map((msg) => {
            if (msg.originalUsername === previousUsername) {
              return {
                ...msg,
                username: username,
                originalUsername: previousUsername,
              };
            }
            return msg;
          });
        }
      } else {
        // Add new user
        const user: User = {
          id: socket.id,
          username,
          room,
          originalUsername: username,
        };
        users.push(user);
        rooms[room].users.push(user);
      }

      // Join socket room
      socket.join(room);

      // Welcome message for user
      socket.emit('message', {
        id: Date.now().toString(),
        text: `Welcome to ${room} room, ${username}!`,
        username: 'System',
        timestamp: Date.now(),
        originalUsername: 'System',
      });

      // Broadcast to others in the room
      socket.broadcast.to(room).emit('message', {
        id: Date.now().toString(),
        text: `${username} has joined the room`,
        username: 'System',
        timestamp: Date.now(),
        originalUsername: 'System',
      });

      // Send room info with all previous messages to the joining user
      socket.emit('roomData', {
        room,
        users: rooms[room].users.map((user) => ({
          id: user.id,
          username: user.username,
          originalUsername: user.originalUsername,
        })),
        messages: rooms[room].messages.map((msg) => ({
          ...msg,
          originalUsername: msg.originalUsername || msg.username,
        })),
      });

      // Broadcast updated room data to all users in the room
      io.to(room).emit('roomData', {
        room,
        users: rooms[room].users.map((user) => ({
          id: user.id,
          username: user.username,
          originalUsername: user.originalUsername,
        })),
        messages: rooms[room].messages.map((msg) => ({
          ...msg,
          originalUsername: msg.originalUsername || msg.username,
        })),
      });

      // Send updated room list with correct user counts
      const roomList = Object.keys(rooms).map((roomName) => ({
        name: roomName,
        userCount: rooms[roomName].users.length,
      }));
      io.emit('roomsList', roomList);
    }
  );

  // Listen for messages
  socket.on('sendMessage', (message: string) => {
    const user = users.find((user) => user.id === socket.id);

    if (user) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        username: user.username,
        timestamp: Date.now(),
        originalUsername: user.originalUsername,
        userId: socket.id,
      };

      rooms[user.room].messages.push(newMessage);

      // Send to everyone in the room including sender
      io.to(user.room).emit('message', newMessage);

      // Update room data for all users
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: rooms[user.room].users.map((u) => ({
          id: u.id,
          username: u.username,
          originalUsername: u.originalUsername,
        })),
        messages: rooms[user.room].messages.map((msg) => ({
          ...msg,
          originalUsername: msg.originalUsername || msg.username,
        })),
      });
    }
  });

  socket.on('disconnect', () => {
    const index = users.findIndex((user) => user.id === socket.id);

    if (index !== -1) {
      const user = users[index];

      // Remove from room's users
      const roomUserIndex = rooms[user.room].users.findIndex(
        (u) => u.id === socket.id
      );
      if (roomUserIndex !== -1) {
        rooms[user.room].users.splice(roomUserIndex, 1);
      }

      socket.broadcast.to(user.room).emit('message', {
        id: Date.now().toString(),
        text: `${user.username} has left the room`,
        username: 'System',
        timestamp: Date.now(),
        originalUsername: 'System',
      });

      // Update room data
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: rooms[user.room].users,
        messages: rooms[user.room].messages.map((msg) => ({
          ...msg,
          originalUsername: msg.originalUsername || msg.username,
        })),
      });

      // Remove from global users
      users.splice(index, 1);

      // Send updated room list with user counts
      const roomList = Object.keys(rooms).map((roomName) => ({
        name: roomName,
        userCount: rooms[roomName].users.length,
      }));
      io.emit('roomsList', roomList);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
