'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';

// SVG Icons
const MessageCircle = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-5.4-1.9L3 21l1.9-4.1A8.38 8.38 0 0 1 3 11.5 8.5 8.5 0 0 1 9.5 3 8.38 8.38 0 0 1 15 4.1a8.5 8.5 0 0 1 6 7.4z" />
  </svg>
);

const Users = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Send = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LogOut = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

interface Message {
  type: 'join' | 'chat_message' | 'user_list' | 'error' | 'leave';
  username?: string;
  message?: string;
  users?: string[];
  timestamp?: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export default function SimpleChatPage() {
  // States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserRef = useRef<string>(''); // Add ref to track current user

  // Update ref whenever currentUser changes
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Connect WebSocket on join
  const handleJoin = (e: FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setError('');

    // Connect to WebSocket
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.onopen = () => {
      setIsConnected(true);
      setIsJoined(true);
      setCurrentUser(username);
      currentUserRef.current = username; // Update ref immediately

      ws.current?.send(JSON.stringify({ type: 'join', username, password }));
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setIsJoined(false);
      setUsers([]);
      setMessages([]);
      setCurrentUser('');
      currentUserRef.current = '';
    };

    ws.current.onerror = () => {
      setError('WebSocket connection error');
    };

    ws.current.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);

      switch (data.type) {
        case 'user_list':
          if (data.users) setUsers(data.users);
          break;

        case 'chat_message':
          if (data.username && data.message && data.timestamp) {
            // Only add message if it's from another user (avoid duplicates)
            if (data.username !== currentUserRef.current) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `${data.username}-${data.timestamp}-${Math.random()}`,
                  username: data.username,
                  message: data.message,
                  timestamp: data.timestamp,
                } as ChatMessage,
              ]);
            }
          }
          break;

        case 'join':
          if (data.username && data.message && data.timestamp) {
            setMessages((prev) => [
              ...prev,
              {
                id: `join-${data.username}-${data.timestamp}`,
                username: data.username,
                message: data.message,
                timestamp: data.timestamp,
                isSystem: true,
              } as ChatMessage,
            ]);
          }
          break;

        case 'leave':
          if (data.username && data.message && data.timestamp) {
            setMessages((prev) => [
              ...prev,
              {
                id: `leave-${data.username}-${data.timestamp}`,
                username: data.username,
                message: data.message,
                timestamp: data.timestamp,
                isSystem: true,
              } as ChatMessage,
            ]);
          }
          break;

        case 'error':
          if (data.message) setError(data.message);
          break;

        default:
          break;
      }
    };
  };

  const handleLeave = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close();
    }
    setIsJoined(false);
    setIsConnected(false);
    setUsers([]);
    setMessages([]);
    setCurrentUser('');
    currentUserRef.current = '';
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    if (newMessage.trim() === '') return;

    const msgToSend = {
      type: 'chat_message',
      username: currentUser,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add message to local state immediately for current user
    const localMessage = {
      id: `${currentUser}-${msgToSend.timestamp}-local`,
      username: currentUser,
      message: newMessage.trim(),
      timestamp: msgToSend.timestamp,
    };

    setMessages((prev) => [...prev, localMessage]);
    ws.current.send(JSON.stringify(msgToSend));
    setNewMessage('');
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isJoined) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <MessageCircle size={32} />
            </div>
            <h1>Join Chat</h1>
            <p>Connect with others instantly</p>
          </div>

          <form onSubmit={handleJoin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                maxLength={20}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <small>* Password is for form completion only</small>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="join-btn">
              Join Chat Room
            </button>
          </form>

          <div className="connection-status">
            <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot" />
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <h2>Chat Room</h2>
            <p>Welcome, {currentUser}</p>
          </div>
          <button onClick={handleLeave} className="leave-btn" title="Leave chat">
            <LogOut size={20} />
          </button>
        </div>

        <div className="users-section">
          <div className="users-header">
            <Users size={20} />
            <h3>Online ({users.length})</h3>
          </div>

          <div className="users-list">
            {users.map((user) => (
              <div
                key={user}
                className={`user-item ${user === currentUser ? 'current-user' : ''}`}
              >
                <div className="user-status" />
                <span className="username">{user}</span>
                {user === currentUser && (
                  <span className="you-badge">You</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot" />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isSystem ? 'system' : msg.username === currentUser ? 'own' : 'other'}`}>
              {msg.isSystem ? (
                <div className="system-message">
                  {msg.message}
                  <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                </div>
              ) : (
                <div className="message-content">
                  {msg.username !== currentUser && (
                    <div className="sender-name">{msg.username}</div>
                  )}
                  <div className="message-bubble">
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            placeholder="Type your message..."
            className="message-input"
            maxLength={500}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}