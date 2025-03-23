import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';

const Chat: React.FC = () => {
  const { username, currentRoom, messages, users, sendMessage, isConnected } =
    useChatContext();
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  if (!isConnected) {
    return <div>Connecting to server...</div>;
  }

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <div className='chat-container' style={styles.container}>
      <div className='sidebar' style={styles.sidebar}>
        <h2 style={styles.roomTitle}>{currentRoom}</h2>
        <div style={styles.userList}>
          <h3 style={styles.userListTitle}>Users ({users.length})</h3>
          <ul style={styles.userListItems}>
            {users.map((user) => (
              <li key={`${user.id}-${user.username}`} style={styles.userItem}>
                {user.username} {user.username === username ? '(You)' : ''}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={() => navigate('/')} style={styles.leaveButton}>
          Leave Room
        </button>
      </div>

      <div className='chat-main' style={styles.chatMain}>
        <div className='messages-container' style={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.message,
                ...(msg.originalUsername === username
                  ? styles.ownMessage
                  : msg.originalUsername === 'System'
                  ? styles.systemMessage
                  : styles.otherMessage),
              }}
            >
              <div style={styles.messageHeader}>
                <span style={styles.messageUsername}>
                  {msg.originalUsername === username
                    ? 'You'
                    : msg.originalUsername}
                </span>
                <span style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p style={styles.messageText}>{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={styles.messageForm}>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Type a message...'
            style={styles.messageInput}
          />
          <button type='submit' style={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2c3e50',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px',
  },
  roomTitle: {
    fontSize: '20px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  userList: {
    flex: 1,
  },
  userListTitle: {
    fontSize: '16px',
    marginBottom: '10px',
  },
  userListItems: {
    listStyle: 'none',
    padding: 0,
  },
  userItem: {
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  leaveButton: {
    backgroundColor: 'rgb(231, 76, 101)',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  chatMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#f8f9fa',
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto' as const,
  },
  message: {
    marginBottom: '15px',
    padding: '10px 15px',
    borderRadius: '10px',
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: 'rgb(215, 255, 244)',
    marginLeft: 'auto',
  },
  systemMessage: {
    backgroundColor: '#ced4da',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center' as const,
    fontStyle: 'italic',
  },
  otherMessage: {
    backgroundColor: '#e9ecef',
    marginRight: 'auto',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '12px',
  },
  messageUsername: {
    fontWeight: 'bold',
  },
  messageTime: {
    color: '#888',
  },
  messageText: {
    margin: 0,
  },
  messageForm: {
    display: 'flex',
    padding: '19px',
    borderTop: '1px solid #ddd',
  },
  messageInput: {
    flex: 1,
    padding: '10px 15px',
    borderRadius: '30px',
    border: '1px solid #ddd',
    marginRight: '10px',
    fontSize: '16px',
  },
  sendButton: {
    backgroundColor: '#00e9ba',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '0 20px',
    cursor: 'pointer',
    fontSize: '16px',
    height: '35px',
    marginTop: '2px',
  },
};

export default Chat;
