import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DigitalHumanAvatar from '../components/DigitalHumanAvatar';
import './TutorSession.css';

const TutorSession = () => {
  const { courseId, topicId } = useParams();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [avatarDetails, setAvatarDetails] = useState(null);

  // Start a new session when component mounts
  useEffect(() => {
    const startSession = async () => {
      try {
        setIsLoading(true);
        
        // Get user's preferred avatar from localStorage or use default
        const preferredAvatarId = localStorage.getItem('preferredAvatarId') || 'default-avatar-id';
        
        const response = await fetch('/api/tutor/session/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            courseId,
            topicId,
            avatarId: preferredAvatarId
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to start session');
        }
        
        const data = await response.json();
        setSession(data);
        setAvatarDetails(data.avatarDetails);
        
        // Add welcome message to messages
        setMessages([
          {
            id: 'welcome',
            sender: 'tutor',
            content: data.welcomeMessage,
            timestamp: new Date().toISOString()
          }
        ]);
        
        // Set avatar to speaking
        setIsSpeaking(true);
        
      } catch (error) {
        console.error('Error starting session:', error);
        alert('Failed to start tutoring session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    startSession();
  }, [courseId, topicId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to messages
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input
    setInputMessage('');
    
    try {
      setIsLoading(true);
      
      // Send message to API
      const response = await fetch(`/api/tutor/session/${session.sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add tutor response to messages
      const tutorMessage = {
        id: data.messageId,
        sender: 'tutor',
        content: data.response,
        timestamp: new Date().toISOString(),
        sourceMaterials: data.sourceMaterials
      };
      
      setMessages(prevMessages => [...prevMessages, tutorMessage]);
      
      // Set suggested follow-up questions
      if (data.suggestedFollowUps) {
        setSuggestedQuestions(data.suggestedFollowUps);
      }
      
      // Set avatar to speaking
      setAvatarEmotion('neutral');
      setIsSpeaking(true);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestionClick = (question) => {
    setInputMessage(question);
  };

  // Handle avatar animation complete
  const handleAnimationComplete = () => {
    setIsSpeaking(false);
    setAvatarEmotion('neutral');
  };

  // Handle end session
  const handleEndSession = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/tutor/session/${session.sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to end session');
      }
      
      const data = await response.json();
      
      // Show session summary
      alert(`Session ended. Summary: ${data.summary}`);
      
      // Redirect to course page
      window.location.href = `/courses/${courseId}`;
      
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session properly, but you can still leave the page.');
    }
  };

  return (
    <div className="tutor-session-container">
      <div className="tutor-session-header">
        <h2>Virtual Tutor Session</h2>
        <button className="end-session-button" onClick={handleEndSession}>
          End Session
        </button>
      </div>
      
      <div className="tutor-session-content">
        <div className="avatar-container">
          {avatarDetails && (
            <DigitalHumanAvatar
              avatarId={avatarDetails.avatarId}
              avatarUrl={avatarDetails.modelUrl || '/default-avatar.glb'}
              message={messages.length > 0 && messages[messages.length - 1].sender === 'tutor' 
                ? messages[messages.length - 1].content 
                : null}
              speaking={isSpeaking}
              emotion={avatarEmotion}
              onAnimationComplete={handleAnimationComplete}
            />
          )}
          <div className="avatar-name">
            {avatarDetails?.name || 'Virtual Tutor'}
          </div>
        </div>
        
        <div className="chat-container">
          <div className="messages-container">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'tutor' ? 'tutor-message' : 'user-message'}`}
              >
                <div className="message-content">{message.content}</div>
                {message.sourceMaterials && message.sourceMaterials.length > 0 && (
                  <div className="message-sources">
                    <span>Sources:</span>
                    <ul>
                      {message.sourceMaterials.map((source, index) => (
                        <li key={index}>{source.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          {suggestedQuestions.length > 0 && (
            <div className="suggested-questions">
              <div className="suggested-questions-label">Suggested questions:</div>
              <div className="suggested-questions-list">
                {suggestedQuestions.map((question, index) => (
                  <button 
                    key={index} 
                    className="suggested-question-button"
                    onClick={() => handleSuggestedQuestionClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="message-input-container">
            <input
              type="text"
              className="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading || isSpeaking}
            />
            <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={isLoading || isSpeaking || !inputMessage.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSession;
