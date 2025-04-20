import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import Avatar from '../components/Avatar';
import SpeechRecognition from '../components/SpeechRecognition';
import SpeechSynthesis from '../components/SpeechSynthesis';
import { useAuth } from '../contexts/AuthContext';
import './TutorSession.css';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}

const TutorSession: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [course, setCourse] = useState<any>(null);
  const [avatar, setAvatar] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'confused'>('neutral');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentSpeechText, setCurrentSpeechText] = useState<string>('');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const memoryRef = useRef<any>({
    studentPreferences: {},
    learningProgress: {},
    difficultTopics: [],
    lastInteractions: []
  });

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Fetch course details
        const courseResponse = await axios.get(`/api/courses/${courseId}`);
        setCourse(courseResponse.data.data.course);
        
        // Fetch available avatars
        const avatarResponse = await axios.get('/api/avatars');
        if (avatarResponse.data.data.length > 0) {
          setAvatar(avatarResponse.data.data[0]);
        }
        
        // Generate a unique session ID
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        
        // Load memory records
        await loadMemoryRecords();
        
        // Add welcome message
        const welcomeMessage = getPersonalizedWelcome();
        setMessages([
          {
            id: `msg_${Date.now()}`,
            sender: 'tutor',
            content: welcomeMessage,
            timestamp: new Date()
          }
        ]);
        
        // Set current speech text for the welcome message
        setCurrentSpeechText(welcomeMessage);
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        navigate('/courses');
      }
    };
    
    initSession();
    
    // Connect to socket server
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    
    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    socketRef.current.on('tutor_response', (data) => {
      if (data.sessionId === sessionId) {
        // Add tutor message
        const tutorMessage = {
          id: `msg_${Date.now()}`,
          sender: 'tutor',
          content: data.content,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, tutorMessage]);
        
        // Set current speech text for speech synthesis
        setCurrentSpeechText(data.content);
        
        // Set avatar to speaking
        setSpeaking(true);
        
        // Set emotion based on message content
        if (data.emotion) {
          setEmotion(data.emotion);
        }
        
        // Update memory with this interaction
        updateMemory('lastInteractions', {
          role: 'tutor',
          content: data.content,
          timestamp: new Date()
        });
        
        // Record tutor interaction
        recordInteraction('response', data.content);
      }
    });
    
    return () => {
      // Disconnect socket when component unmounts
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [courseId, navigate, sessionId]);
  
  // Load memory records from API
  const loadMemoryRecords = async () => {
    try {
      // Fetch user's memory records
      const response = await axios.get('/api/memory', {
        params: {
          category: `course_${courseId}`
        }
      });
      
      const records = response.data.data;
      
      // Process memory records
      records.forEach((record: any) => {
        const { key, value } = record;
        
        if (key.startsWith('pref_')) {
          memoryRef.current.studentPreferences[key.replace('pref_', '')] = value;
        } else if (key.startsWith('progress_')) {
          memoryRef.current.learningProgress[key.replace('progress_', '')] = value;
        } else if (key === 'difficult_topics') {
          memoryRef.current.difficultTopics = JSON.parse(value);
        } else if (key === 'last_interactions') {
          memoryRef.current.lastInteractions = JSON.parse(value);
        }
      });
      
    } catch (error) {
      console.error('Error loading memory records:', error);
    }
  };
  
  // Update memory
  const updateMemory = async (key: string, value: any) => {
    try {
      // Update local memory reference
      if (key === 'studentPreferences') {
        memoryRef.current.studentPreferences = {
          ...memoryRef.current.studentPreferences,
          ...value
        };
      } else if (key === 'learningProgress') {
        memoryRef.current.learningProgress = {
          ...memoryRef.current.learningProgress,
          ...value
        };
      } else if (key === 'difficultTopics') {
        memoryRef.current.difficultTopics = Array.isArray(value) ? 
          value : [...memoryRef.current.difficultTopics, value];
      } else if (key === 'lastInteractions') {
        memoryRef.current.lastInteractions = [
          value,
          ...memoryRef.current.lastInteractions.slice(0, 9) // Keep last 10 interactions
        ];
      }
      
      // Store in API
      let apiKey, apiValue, apiType, importance;
      
      if (key === 'studentPreferences') {
        // Store each preference separately
        Object.entries(value).forEach(([prefKey, prefValue]) => {
          storeMemoryRecord(`pref_${prefKey}`, prefValue, 'long_term', 3);
        });
      } else if (key === 'learningProgress') {
        // Store each progress item separately
        Object.entries(value).forEach(([progressKey, progressValue]) => {
          storeMemoryRecord(`progress_${progressKey}`, progressValue, 'long_term', 3);
        });
      } else if (key === 'difficultTopics') {
        storeMemoryRecord('difficult_topics', JSON.stringify(memoryRef.current.difficultTopics), 'long_term', 2);
      } else if (key === 'lastInteractions') {
        storeMemoryRecord('last_interactions', JSON.stringify(memoryRef.current.lastInteractions), 'short_term', 1);
      }
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };
  
  // Store memory record in API
  const storeMemoryRecord = async (key: string, value: any, type: 'short_term' | 'long_term', importance: number) => {
    try {
      await axios.post('/api/memory', {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value,
        type,
        category: `course_${courseId}`,
        importance,
        context: { courseId }
      });
    } catch (error) {
      console.error('Error storing memory record:', error);
    }
  };
  
  // Get personalized welcome message based on memory
  const getPersonalizedWelcome = () => {
    const { lastInteractions, studentPreferences } = memoryRef.current;
    
    // If this is a returning student with previous interactions
    if (lastInteractions.length > 0) {
      const lastTopic = lastInteractions[0]?.content?.match(/about (.+?)[.?!]/i)?.[1];
      
      if (lastTopic) {
        return `Welcome back, ${user?.firstName || 'student'}! Last time we were discussing ${lastTopic}. Would you like to continue where we left off?`;
      }
      
      return `Welcome back, ${user?.firstName || 'student'}! I'm glad to see you again. What would you like to learn today?`;
    }
    
    // First-time student
    return `Hello, ${user?.firstName || 'student'}! I'm your virtual tutor for ${course?.title || 'this course'}. What would you like to learn about today?`;
  };
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Record interaction in database
  const recordInteraction = async (type: 'question' | 'response', content: string) => {
    try {
      await axios.post('/api/interactions', {
        sessionId,
        type,
        content,
        context: {
          courseId
        }
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Record user interaction
    await recordInteraction('question', input);
    
    // Update memory with this interaction
    updateMemory('lastInteractions', {
      role: 'user',
      content: input,
      timestamp: new Date()
    });
    
    // Set avatar to thinking while processing
    setEmotion('thinking');
    
    // Emit message to socket server
    if (socketRef.current) {
      socketRef.current.emit('tutor_message', {
        sessionId,
        content: input,
        courseId,
        memory: memoryRef.current
      });
    }
    
    // Clear input
    setInput('');
  };
  
  // Handle speech recognition result
  const handleSpeechResult = (transcript: string) => {
    setInput(transcript);
  };
  
  // Handle speech synthesis events
  const handleSpeechStart = () => {
    setSpeaking(true);
  };
  
  const handleSpeechEnd = () => {
    setSpeaking(false);
    setEmotion('neutral');
  };
  
  // Toggle voice mode
  const toggleVoiceMode = () => {
    setVoiceEnabled(!voiceEnabled);
  };
  
  if (loading) {
    return <div className="loading">Loading tutor session...</div>;
  }
  
  return (
    <div className="tutor-session">
      <header className="tutor-header">
        <h2>{course?.title} - Virtual Tutor Session</h2>
        <div className="header-controls">
          <button 
            className={`voice-toggle ${voiceEnabled ? 'enabled' : 'disabled'}`}
            onClick={toggleVoiceMode}
            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={() => navigate('/courses')} className="back-button">
            Back to Courses
          </button>
        </div>
      </header>
      
      <div className="tutor-content">
        <div className="avatar-section">
          {avatar ? (
            <Avatar
              modelUrl={avatar.modelUrl}
              speaking={speaking}
              emotion={emotion}
              scale={1.5}
              position={[0, -0.5, 0]}
            />
          ) : (
            <div className="avatar-placeholder">
              Avatar not available
            </div>
          )}
          
          {voiceEnabled && (
            <div className="speech-controls">
              <SpeechSynthesis
                text={currentSpeechText}
                voice={avatar?.voiceId}
                autoPlay={true}
                onStart={handleSpeechStart}
                onEnd={handleSpeechEnd}
              />
            </div>
          )}
        </div>
        
        <div className="chat-section">
          <div className="messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'tutor-message'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="message-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
            
            {voiceEnabled && (
              <SpeechRecognition
                onResult={handleSpeechResult}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSession;
