import React, { useState, useEffect } from 'react';
import './SpeechSynthesis.css';

interface SpeechSynthesisProps {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  autoPlay?: boolean;
}

const SpeechSynthesis: React.FC<SpeechSynthesisProps> = ({
  text,
  voice = '',
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  autoPlay = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      setError('Speech synthesis is not supported in this browser.');
      return;
    }

    // Get available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Auto-play if enabled
    if (autoPlay && text) {
      speak();
    }

    // Cleanup
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [autoPlay, text]);

  const speak = () => {
    if (!supported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if specified
    if (voice && voices.length > 0) {
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Set other properties
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Set event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (onStart) onStart();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (!supported || !isSpeaking) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resume = () => {
    if (!supported || !isPaused) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stop = () => {
    if (!supported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="speech-synthesis">
      {!supported ? (
        <div className="speech-error">
          {error}
          <p>Please try using Chrome, Edge, or Safari for speech synthesis.</p>
        </div>
      ) : (
        <>
          <div className="speech-controls">
            {!isSpeaking ? (
              <button 
                className="speech-button play"
                onClick={speak}
                disabled={!text}
                title="Speak"
              >
                <span className="speech-icon">🔊</span>
              </button>
            ) : isPaused ? (
              <button 
                className="speech-button resume"
                onClick={resume}
                title="Resume"
              >
                <span className="speech-icon">▶️</span>
              </button>
            ) : (
              <button 
                className="speech-button pause"
                onClick={pause}
                title="Pause"
              >
                <span className="speech-icon">⏸️</span>
              </button>
            )}
            
            {(isSpeaking || isPaused) && (
              <button 
                className="speech-button stop"
                onClick={stop}
                title="Stop"
              >
                <span className="speech-icon">⏹️</span>
              </button>
            )}
          </div>
          
          {error && <div className="speech-error">{error}</div>}
        </>
      )}
    </div>
  );
};

export default SpeechSynthesis;
