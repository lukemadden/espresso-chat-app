import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';

const Login: React.FC = () => {
  const [tempUsername, setTempUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [customRoom, setCustomRoom] = useState('');
  const { joinRoom, rooms } = useChatContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUsername) return;

    const roomToJoin = room === 'custom' ? customRoom : room;
    if (roomToJoin) {
      joinRoom(tempUsername, roomToJoin);
      navigate('/chat');
    }
  };

  return (
    <div className='login-container' style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Join a Chat Room</h2>

        <div style={styles.inputGroup}>
          <label htmlFor='username' style={styles.label}>
            Username:
          </label>
          <input
            type='text'
            id='username'
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            style={styles.input}
            placeholder='Enter your username'
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor='room' style={styles.label}>
            Select Room:
          </label>
          <select
            id='room'
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={styles.input}
          >
            {rooms.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} ({r.userCount} users)
              </option>
            ))}
            <option value='custom'>Create new room</option>
          </select>
        </div>

        {room === 'custom' && (
          <div style={styles.inputGroup}>
            <label htmlFor='customRoom' style={styles.label}>
              Room Name:
            </label>
            <input
              type='text'
              id='customRoom'
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              style={styles.input}
              placeholder='Enter room name'
              required
            />
          </div>
        )}

        <button type='submit' style={styles.button}>
          Join Chat
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  form: {
    width: '400px',
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '15px',
    color: '#333',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fonstSize: '14px',
    fontWeight: 'bold' as const,
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4169E1',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
};

export default Login;
