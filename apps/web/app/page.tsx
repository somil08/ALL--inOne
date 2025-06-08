'use client';

import Link from 'next/link';
import './Home.css';

// SVG Icons
const MessageCircle = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-5.4-1.9L3 21l1.9-4.1A8.38 8.38 0 0 1 3 11.5 8.5 8.5 0 0 1 9.5 3 8.38 8.38 0 0 1 15 4.1a8.5 8.5 0 0 1 6 7.4z" />
  </svg>
);

const BookOpen = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const Users = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

export default function Home() {
  return (
    <main className="home-container">
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <h1 className="main-title">Welcome to Our Platform</h1>
          <p className="subtitle">
            Connect, share, and explore with our community platform featuring real-time chat and engaging blog content.
          </p>
        </header>

        {/* Navigation Cards */}
        <div className="cards-grid">
          {/* Chat Room Card */}
          <div className="card">
            <div className="card-header">
              <div className="icon-wrapper chat-icon">
                <MessageCircle size={32} />
              </div>
              <div className="card-title-section">
                <h2 className="card-title">Chat Room</h2>
                <p className="card-subtitle">Join live conversations</p>
              </div>
            </div>
            <p className="card-description">
              Connect with other users in real-time. Share ideas, ask questions, and build meaningful connections in our interactive chat environment.
            </p>
            <div className="card-footer">
              <div className="feature-info">
                <Users size={16} />
                <span>Real-time messaging</span>
              </div>
              <Link href="/Chat" className="btn btn-primary">
                Enter Chat Room
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Blog Card */}
          <div className="card">
            <div className="card-header">
              <div className="icon-wrapper blog-icon">
                <BookOpen size={32} />
              </div>
              <div className="card-title-section">
                <h2 className="card-title">Blog</h2>
                <p className="card-subtitle">Read and write articles</p>
              </div>
            </div>
            <p className="card-description">
              Discover insightful articles, tutorials, and stories from our community. Share your own experiences and learn from others.
            </p>
            <div className="card-footer">
              <div className="feature-info">
                <BookOpen size={16} />
                <span>Articles & Stories</span>
              </div>
              <Link href="/Blog" className="btn btn-secondary">
                Read Blog
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>© 2024 Your Platform. Built with Next.js</p>
        </footer>
      </div>
    </main>
  );
}