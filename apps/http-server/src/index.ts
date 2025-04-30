import  express from 'express';
import { client } from "@repo/db/client";
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/signup', async(req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  const user = await client.user.create({
    data: {
      username: username,
      password: password,
    },
  });
  res.json({
    message: 'User created successfully',
    id: user.id,
  });
});
app.listen(3002), () => {
  console.log('Server is running on http://localhost:3000');
}