import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DigitalHumanAvatar from '../components/DigitalHumanAvatar';
import './Home.css';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [demoMessage, setDemoMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Load demo avatars
    const loadDemoAvatars = async () => {
      try {
        // In a real app, you would fetch from API
        // For demo purposes, we'll use static data
        const demoAvatars = [
          {
            id: 'avatar1',
            name: 'Professor Alex',
            gender: 'male',
            style: 'professional',
            previewImageUrl: '/assets/avatars/professor-alex.jpg',
            modelUrl: '/assets/models/professor-alex.glb',
            specialties: ['Mathematics', 'Physics']
          },
          {
            id: 'avatar2',
            name: 'Dr. Sophia',
            gender: 'female',
            style: 'friendly',
            previewImageUrl: '/assets/avatars/dr-sophia.jpg',
            modelUrl: '/assets/models/dr-sophia.glb',
            specialties: ['Biology', 'Chemistry']
          },
          {
            id: 'avatar3',
            name: 'Tutor Max',
            gender: 'male',
            style: 'casual',
            previewImageUrl: '/assets/avatars/tutor-max.jpg',
            modelUrl: '/assets/models/tutor-max.glb',
            specialties: ['Computer Science', 'Programming']
          }
        ];
        
        setAvatars(demoAvatars);
        setSelectedAvatar(demoAvatars[0]);
      } catch (error) {
        console.error('Error loading demo avatars:', error);
      }
    };
    
    loadDemoAvatars();
  }, []);

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleDemoClick = () => {
    const demoMessages = [
      "Hello! I'm your virtual tutor. I can help you learn any subject through personalized lessons and interactive exercises.",
      "Welcome to Virtual Tutor! I'm here to provide personalized learning experiences tailored to your specific needs and learning style.",
      "Hi there! I can explain complex concepts, answer your questions, and help you practice with customized exercises based on your progress."
    ];
    
    const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
    setDemoMessage(randomMessage);
    setIsSpeaking(true);
  };

  const handleAnimationComplete = () => {
    setIsSpeaking(false);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Learn Anything with Your Personal AI Tutor</h1>
          <p>
            Virtual Tutor provides personalized learning experiences with AI-powered
            digital human tutors for any course taught in your school.
          </p>
          {isAuthenticated ? (
            <Link to="/courses" className="cta-button">
              Explore Courses
            </Link>
          ) : (
            <Link to="/register" className="cta-button">
              Get Started
            </Link>
          )}
        </div>
        
        <div className="hero-image">
          <img src="/assets/images/hero-image.jpg" alt="Virtual Tutor in action" />
        </div>
      </section>
      
      <section className="features-section">
        <h2>Why Choose Virtual Tutor?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon ai-icon"></div>
            <h3>Powered by Advanced AI</h3>
            <p>
              Our tutors use state-of-the-art Large Language Models and
              Retrieval-Augmented Generation for accurate, helpful responses.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon personalized-icon"></div>
            <h3>Personalized Learning</h3>
            <p>
              Adaptive learning paths based on your performance, with
              focus on areas that need improvement.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon memory-icon"></div>
            <h3>Continuous Progress</h3>
            <p>
              Short-term and long-term memory allows tutors to remember
              your progress and resume exactly where you left off.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon avatar-icon"></div>
            <h3>Digital Human Avatars</h3>
            <p>
              Engage with lifelike digital tutors that use natural speech
              and expressions for an immersive learning experience.
            </p>
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Meet Your Virtual Tutors</h2>
        <div className="demo-container">
          <div className="avatar-selection">
            <h3>Choose an Avatar</h3>
            <div className="avatar-options">
              {avatars.map(avatar => (
                <div 
                  key={avatar.id}
                  className={`avatar-option ${selectedAvatar && selectedAvatar.id === avatar.id ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <div className="avatar-preview">
                    <img src={avatar.previewImageUrl} alt={avatar.name} />
                  </div>
                  <div className="avatar-info">
                    <h4>{avatar.name}</h4>
                    <p>Specialties: {avatar.specialties.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="avatar-demo">
            <div className="avatar-container">
              {selectedAvatar && (
                <DigitalHumanAvatar
                  avatarId={selectedAvatar.id}
                  avatarUrl={selectedAvatar.modelUrl}
                  message={demoMessage}
                  speaking={isSpeaking}
                  emotion="neutral"
                  onAnimationComplete={handleAnimationComplete}
                />
              )}
            </div>
            <div className="demo-controls">
              <button 
                className="demo-button"
                onClick={handleDemoClick}
                disabled={isSpeaking}
              >
                {isSpeaking ? 'Listening...' : 'Start Demo'}
              </button>
              <p className="demo-hint">
                Click the button to hear your virtual tutor speak!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <h2>Ready to Transform Your Learning Experience?</h2>
        <p>
          Join thousands of students who are already benefiting from
          personalized AI tutoring.
        </p>
        {isAuthenticated ? (
          <Link to="/courses" className="cta-button">
            Explore Courses
          </Link>
        ) : (
          <Link to="/register" className="cta-button">
            Sign Up Now
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;
