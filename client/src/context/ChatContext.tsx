import React, { createContext, useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
  room: string;
}

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: number;
  originalUsername: string;
}

interface Room {
  name: string;
  userCount: number;
}

interface ChatContextType {
  socket: Socket | null;
  username: string;
  setUsername: (name: string) => void;
  currentRoom: string;
  setCurrentRoom: (room: string) => void;
  messages: Message[];
  users: User[];
  rooms: Room[];
  joinRoom: (username: string, room: string) => void;
  sendMessage: (message: string) => void;
  isConnected: boolean;
  error: string | null;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const setupSocketListeners = (socketInstance: Socket) => {
    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('message', (message: Message) => {
      if (
        message.username === 'System' &&
        message.text.includes('already taken')
      ) {
        setError(message.text);
        setUsername('');
        setCurrentRoom('');
      } else {
        // Ensure originalUsername is set
        const messageWithOriginalUsername = {
          ...message,
          originalUsername: message.originalUsername || message.username,
        };
        setMessages((prevMessages) => [
          ...prevMessages,
          messageWithOriginalUsername,
        ]);
      }
    });

    socketInstance.on(
      'roomData',
      (data: { users: User[]; messages: Message[] }) => {
        // Update users list, remove duplicates
        const uniqueUsers = data.users.reduce((acc, current) => {
          const exists = acc.find((user) => user.username === current.username);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, [] as User[]);

        setUsers(uniqueUsers);

        // Update messages with proper originalUsername
        if (data.messages) {
          const messagesWithOriginalUsername = data.messages.map((msg) => ({
            ...msg,
            originalUsername: msg.originalUsername || msg.username,
          }));
          // Replace all messages instead of appending
          setMessages(messagesWithOriginalUsername);
        }
      }
    );

    socketInstance.on(
      'roomsList',
      (roomsList: { name: string; userCount: number }[]) => {
        setRooms(roomsList);
      }
    );
  };

  useEffect(() => {
    const socketInstance = io('http://localhost:3001');
    setSocket(socketInstance);
    setupSocketListeners(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fetch available rooms when component mounts
  useEffect(() => {
    fetch('http://localhost:3001/api/rooms')
      .then((response) => response.json())
      .then((data) => setRooms(data))
      .catch((error) => console.error('Error fetching rooms:', error));
  }, []);

  const joinRoom = (username: string, room: string) => {
    setUsername(username);
    setCurrentRoom(room);

    if (socket) {
      socket.emit('join', { username, room });
    }
  };

  const sendMessage = (message: string) => {
    if (socket && message.trim()) {
      socket.emit('sendMessage', message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        username,
        setUsername,
        currentRoom,
        setCurrentRoom,
        messages,
        users,
        rooms,
        joinRoom,
        sendMessage,
        isConnected,
        error,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
