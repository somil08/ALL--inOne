import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

interface AuthenticatedWebSocket extends WebSocket {
  username?: string;
  isAlive?: boolean;
}

interface Message {
  type: 'join' | 'chat_message' | 'user_list' | 'error';
  username?: string;
  message?: string;
  users?: string[];
  timestamp?: string;
}

const clients = new Set<AuthenticatedWebSocket>();
const users = new Map<string, AuthenticatedWebSocket>();

function broadcast(message: Message, excludeSocket?: AuthenticatedWebSocket) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client !== excludeSocket && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function getUserList(): string[] {
  return Array.from(users.keys());
}

wss.on('connection', (socket: WebSocket) => {
  const userSocket = socket as AuthenticatedWebSocket;

  console.log('New WebSocket connection');

  userSocket.isAlive = true;
  clients.add(userSocket);

  userSocket.on('pong', () => {
    userSocket.isAlive = true;
  });

  userSocket.on('message', (data) => {
    try {
      const message: Message = JSON.parse(
        typeof data === 'string' ? data : data.toString()
      );

      switch (message.type) {
        case 'join': {
          const username = message.username?.trim();
          if (!username) {
            userSocket.send(
              JSON.stringify({ type: 'error', message: 'Username is required' })
            );
            return;
          }

          if (users.has(username)) {
            userSocket.send(
              JSON.stringify({ type: 'error', message: 'Username is already taken' })
            );
            return;
          }

          userSocket.username = username;
          users.set(username, userSocket);

          userSocket.send(
            JSON.stringify({
              type: 'join',
              message: `Welcome to the chat, ${username}!`,
              users: getUserList(),
            })
          );

          broadcast(
            {
              type: 'user_list',
              message: `${username} joined the chat`,
              users: getUserList(),
            },
            userSocket
          );

          console.log(`User ${username} joined`);
          break;
        }

        case 'chat_message': {
          if (!userSocket.username) {
            userSocket.send(
              JSON.stringify({ type: 'error', message: 'You must join first' })
            );
            return;
          }

          const chatMessage = message.message?.trim();
          if (!chatMessage) {
            userSocket.send(
              JSON.stringify({ type: 'error', message: 'Message cannot be empty' })
            );
            return;
          }

          broadcast({
            type: 'chat_message',
            username: userSocket.username,
            message: chatMessage,
            timestamp: new Date().toISOString(),
          });

          console.log(`${userSocket.username}: ${chatMessage}`);
          break;
        }

        default:
          userSocket.send(
            JSON.stringify({ type: 'error', message: 'Unknown message type' })
          );
      }
    } catch (error) {
      console.error('Message handling error:', error);
      userSocket.send(
        JSON.stringify({ type: 'error', message: 'Invalid message format' })
      );
    }
  });

  userSocket.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(userSocket);

    if (userSocket.username) {
      users.delete(userSocket.username);

      broadcast({
        type: 'user_list',
        message: `${userSocket.username} left the chat`,
        users: getUserList(),
      });

      console.log(`User ${userSocket.username} left`);
    }
  });

  userSocket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const socket = ws as AuthenticatedWebSocket;

    if (socket.isAlive === false) {
      console.log('Terminating inactive socket');
      clients.delete(socket);
      if (socket.username) {
        users.delete(socket.username);
      }
      return socket.terminate();
    }

    socket.isAlive = false;
    socket.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  server.close();
  process.exit(0);
});
