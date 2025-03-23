import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

const App: React.FC = () => {
  return (
    <ChatProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </Router>
    </ChatProvider>
  );
};

export default App;
