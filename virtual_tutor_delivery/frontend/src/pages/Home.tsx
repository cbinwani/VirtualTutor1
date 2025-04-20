import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredAvatars, setFeaturedAvatars] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await axios.get('/api/avatars');
        setFeaturedAvatars(response.data.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching avatars:', error);
      }
    };
    
    fetchAvatars();
  }, []);
  
  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Meet Your New AI Tutor</h1>
          <p>Personalized learning with digital human tutors for any course taught in your school</p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="cta-button">Go to Dashboard</Link>
          ) : (
            <Link to="/register" className="cta-button">Get Started</Link>
          )}
        </div>
        <div className="hero-image">
          <img src="/assets/hero-tutor.png" alt="Virtual Tutor" />
        </div>
      </header>
      
      <section className="features-section">
        <h2>Why Choose Virtual Tutor?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Learning</h3>
            <p>Adaptive learning paths tailored to your skill level and learning style</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Memory Capabilities</h3>
            <p>Tutors remember your progress and can resume from where you left off</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Interactive Conversations</h3>
            <p>Natural dialogue with digital human avatars that respond to your questions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Performance Tracking</h3>
            <p>Identify areas of improvement and track your progress over time</p>
          </div>
        </div>
      </section>
      
      <section className="avatars-section">
        <h2>Meet Our Digital Tutors</h2>
        <div className="avatars-grid">
          {featuredAvatars.map(avatar => (
            <div key={avatar._id} className="avatar-card">
              <div className="avatar-image">
                <img src={avatar.thumbnailUrl} alt={avatar.name} />
              </div>
              <h3>{avatar.name}</h3>
              <p>{avatar.characteristics?.specialization?.join(', ') || 'General Tutor'}</p>
            </div>
          ))}
        </div>
        {isAuthenticated ? (
          <Link to="/courses" className="secondary-button">Explore Courses</Link>
        ) : (
          <Link to="/login" className="secondary-button">Login to Start Learning</Link>
        )}
      </section>
      
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register & Set Preferences</h3>
            <p>Create your account and tell us about your learning goals</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose Your Courses</h3>
            <p>Browse available courses and select what you want to learn</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Learn with Your Tutor</h3>
            <p>Engage with your digital tutor through interactive sessions</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track Your Progress</h3>
            <p>Monitor your improvement and adjust your learning path</p>
          </div>
        </div>
      </section>
      
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">Virtual Tutor</div>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} Virtual Tutor. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
