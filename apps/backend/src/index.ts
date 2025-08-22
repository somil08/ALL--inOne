import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import { client } from '@repo/db';

const app: Application = express();
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// testing

// User signup endpoint
app.post('/signup', (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  client.user.create({
    data: { username, password },
  })
  .then(user => {
    res.json({
      message: 'User created successfully',
      id: user.id,
    });
  })
  .catch(next);
});

// Get all blog posts
app.get('/blogs', (req: Request, res: Response, next: NextFunction) => {
  client.blog.findMany({
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  .then(blogs => {
    res.json(blogs);
  })
  .catch(next);
});

// Get single blog post
app.get('/blogs/:id', (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Blog ID is required' });
    return;
  }

  client.blog.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  })
  .then(blog => {
    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    res.json(blog);
  })
  .catch(next);
});

// Create new blog post
app.post('/blogs', (req: Request, res: Response, next: NextFunction) => {
  const { title, content, username, password } = req.body;

  if (!title || !content || !username || !password) {
    res.status(400).json({ 
      error: 'Title, content, username, and password are required' 
    });
    return;
  }

  client.user.findUnique({
    where: { username }
  })
  .then(user => {
    if (!user) {
      return client.user.create({
        data: { username, password }
      });
    } else {
      if (user.password !== password) {
        const error = new Error('Invalid credentials') as any;
        error.status = 401;
        throw error;
      }
      return user;
    }
  })
  .then(user => {
    return client.blog.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  })
  .then(blog => {
    res.status(201).json({
      message: 'Blog created successfully',
      blog,
    });
  })
  .catch(next);
});

// Update blog post
app.put('/blogs/:id', (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, content, username, password } = req.body;

  if (!id) {
    res.status(400).json({ error: 'Blog ID is required' });
    return;
  }

  client.blog.findUnique({
    where: { id: parseInt(id) },
    include: { author: true }
  })
  .then(existingBlog => {
    if (!existingBlog) {
      const error = new Error('Blog not found') as any;
      error.status = 404;
      throw error;
    }

    if (existingBlog.author.username !== username || existingBlog.author.password !== password) {
      const error = new Error('Unauthorized to edit this blog') as any;
      error.status = 403;
      throw error;
    }

    return client.blog.update({
      where: { id: parseInt(id) },
      data: { title, content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  })
  .then(blog => {
    res.json({
      message: 'Blog updated successfully',
      blog,
    });
  })
  .catch(next);
});

// Delete blog post
app.delete('/blogs/:id', (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Blog ID is required' });
    return;
  }

  client.blog.delete({
    where: { id: parseInt(id) },
  })
  .then(() => {
    res.json({ message: 'Blog deleted successfully' });
  })
  .catch(next);
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ error: message });
});

app.listen(3002, () => {
  console.log('Server is running on http://localhost:3002');
});