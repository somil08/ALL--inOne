'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState('');
  const [wsMessage, setWsMessage] = useState('');

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onmessage = (event) => {
      console.log('WebSocket message:', event.data);
      setWsMessage(event.data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsMessage('WebSocket error');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Form submit to HTTP server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3002/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Signup Form (HTTP Server)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Sign Up
        </button>
      </form>

      {response && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">HTTP server Response:</h2>
          <pre>{response}</pre>
        </div>
      )}

      <div className="mt-6 bg-green-100 p-4 rounded">
        <h2 className="font-semibold">WebSocket Message:</h2>
        <p>{wsMessage}</p>
      </div>
    </main>
  );
}
