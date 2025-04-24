import { WebSocketServer } from 'ws';
import { client } from '@repo/db/client'; // Ensure this path is correct and the client is properly configured

const server = new WebSocketServer({ port: 3001 });

server.on('connection', async (socket) => {
  try {
    // Create a new user with random credentials
    const newUser = await client.user.create({
      data: {
        username: Math.random().toString(36).substring(2, 15),
        password: Math.random().toString(36).substring(2, 15),
      },
    });

    console.log('New user created:', newUser);

    // Send a greeting message to the client
    socket.send('Hi! Welcome to the WebSocket server.');
  } catch (error) {
    console.error('Error creating user:', error);
    socket.send('An error occurred while creating a new user.');
  }
});
