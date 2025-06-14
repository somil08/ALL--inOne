'use client';

import { useState, useEffect } from 'react';
import './Blog.css';

// SVG Icons
const Edit = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

const Plus = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const Save = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </svg>
);

const X = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const Calendar = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const User = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ArrowLeft = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

interface Blog {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
  };
}

interface BlogFormData {
  title: string;
  content: string;
  username: string;
  password: string;
}

const API_BASE = 'http://localhost:3002';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    username: '',
    password: ''
  });

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch blogs from server
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/blogs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Failed to load blogs. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Validate form data
  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.content.trim()) return 'Content is required';
    if (!formData.username.trim()) return 'Username is required';
    if (!formData.password.trim()) return 'Password is required';
    if (formData.title.trim().length < 3) return 'Title must be at least 3 characters long';
    if (formData.content.trim().length < 10) return 'Content must be at least 10 characters long';
    return null;
  };

  // Submit new blog post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const url = editingId 
        ? `${API_BASE}/blogs/${editingId}`
        : `${API_BASE}/blogs`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          username: formData.username.trim(),
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Reset form and refresh blogs
      setFormData({ title: '', content: '', username: '', password: '' });
      setIsWriting(false);
      setEditingId(null);
      setSuccess(editingId ? 'Article updated successfully!' : 'Article published successfully!');
      
      await fetchBlogs();
      
    } catch (err: any) {
      console.error('Error saving blog:', err);
      setError(err.message || 'Failed to save blog. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing a blog
  const startEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      content: blog.content,
      username: '', // User needs to enter credentials to edit
      password: ''
    });
    setEditingId(blog.id);
    setIsWriting(true);
    setError('');
    setSuccess('');
  };

  // Cancel writing/editing
  const cancelWriting = () => {
    setIsWriting(false);
    setEditingId(null);
    setFormData({ title: '', content: '', username: '', password: '' });
    setError('');
    setSuccess('');
  };

  // Start writing new article
  const startWriting = () => {
    setIsWriting(true);
    setEditingId(null);
    setFormData({ title: '', content: '', username: '', password: '' });
    setError('');
    setSuccess('');
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // If in writing mode, show full-screen editor
  if (isWriting) {
    return (
      <div className="writing-mode">
        <div className="writing-container">
          {/* Writing Header */}
          <div className="writing-header">
            <div className="writing-header-left">
              <button 
                onClick={cancelWriting}
                className="btn btn-ghost back-btn"
                type="button"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <h1>{editingId ? 'Edit Article' : 'Write New Article'}</h1>
            </div>
            
            <div className="writing-header-right">
              <button 
                type="button" 
                onClick={cancelWriting}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="blog-form"
                className="btn btn-primary"
                disabled={submitting}
              >
                <Save size={18} />
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="message error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="message success-message">
              {success}
            </div>
          )}

          {/* Writing Form */}
          <div className="writing-content">
            <form id="blog-form" onSubmit={handleSubmit} className="writing-form">
              {/* Credentials Row */}
              <div className="credentials-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="form-input"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="form-input"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              
              {/* Title */}
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your article title..."
                  className="form-input title-input"
                  required
                  disabled={submitting}
                />
              </div>
              
              {/* Content */}
              <div className="form-group content-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your article content..."
                  className="form-textarea content-textarea"
                  required
                  disabled={submitting}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main blog list view
  return (
    <main className="blog-container">
      <div className="blog-wrapper">
        {/* Header */}
        <header className="blog-header">
          <div className="header-content">
            <h1 className="blog-title">Blog</h1>
            <p className="blog-subtitle">Share your thoughts and read amazing stories</p>
          </div>
          
          <button 
            onClick={startWriting}
            className="btn btn-primary write-btn"
          >
            <Plus size={20} />
            Write Article
          </button>
        </header>

        {/* Messages */}
        {error && (
          <div className="message error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="message success-message">
            {success}
          </div>
        )}

        {/* Blog Posts List */}
        <div className="blogs-section">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <h3>No articles yet</h3>
              <p>Be the first to write an article!</p>
              <button 
                onClick={startWriting}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Write First Article
              </button>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <article key={blog.id} className="blog-card">
                  <div className="blog-card-header">
                    <h3 className="blog-card-title">{blog.title}</h3>
                    <button
                      onClick={() => startEdit(blog)}
                      className="btn btn-ghost edit-btn"
                      title="Edit article"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                  
                  <div className="blog-card-meta">
                    <div className="meta-item">
                      <User size={14} />
                      <span>{blog.author.username}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="blog-card-content">
                    <p>{blog.content.length > 200 
                      ? `${blog.content.substring(0, 200)}...` 
                      : blog.content
                    }</p>
                  </div>
                  
                  <div className="blog-card-footer">
                    <span className="read-time">
                      {Math.ceil(blog.content.split(' ').length / 200)} min read
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}