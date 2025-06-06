import express from 'express';
import cors from 'cors';
import { client } from "../../../packages/db/src";

const app = express();
app.use(cors()); // allow cross-origin requests
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await client.user.create({
      data: { username, password },
    });

    res.json({
      message: 'User created successfully',
      id: user.id,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3002, () => {
  console.log('Server is running on http://localhost:3002');
});
