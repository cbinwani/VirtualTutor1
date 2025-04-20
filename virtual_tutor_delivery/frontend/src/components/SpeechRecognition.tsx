import React, { useState, useEffect, useRef } from 'react';
import './SpeechRecognition.css';

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onListening?: (isListening: boolean) => void;
  language?: string;
  continuous?: boolean;
  autoStart?: boolean;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onResult,
  onListening,
  language = 'en-US',
  continuous = false,
  autoStart = false
}) => {
  const [isListening, setIsListening] = useState<boolean>(autoStart);
  const [error, setError] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    // Set up event handlers
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      if (onListening) onListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (onListening) onListening(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      onResult(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      if (onListening) onListening(false);
    };

    // Start recognition if autoStart is true
    if (autoStart) {
      startListening();
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, autoStart, onListening, onResult]);

  const startListening = () => {
    if (!supported) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
    }
  };

  const stopListening = () => {
    if (!supported) return;
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Speech recognition error:', error);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="speech-recognition">
      {!supported ? (
        <div className="speech-error">
          {error}
          <p>Please try using Chrome, Edge, or Safari for speech recognition.</p>
        </div>
      ) : (
        <>
          <button 
            className={`speech-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            <span className="speech-icon">🎤</span>
            {isListening ? 'Listening...' : 'Speak'}
          </button>
          {error && <div className="speech-error">{error}</div>}
        </>
      )}
    </div>
  );
};

export default SpeechRecognition;
