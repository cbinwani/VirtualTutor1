// Speech engine utility for Digital Human Avatar
export const createSpeechEngine = () => {
  // Check if browser supports speech synthesis
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported in this browser');
    return {
      speak: (text, options) => {
        console.warn('Speech synthesis not available, cannot speak:', text);
        if (options && options.onEnd) {
          setTimeout(options.onEnd, 1000);
        }
      },
      cancel: () => {}
    };
  }

  // Create speech synthesis instance
  const synth = window.speechSynthesis;
  let currentUtterance = null;

  // Helper to get best voice
  const getBestVoice = (preferredLang = 'en-US', preferredGender = 'female') => {
    const voices = synth.getVoices();
    
    if (voices.length === 0) {
      return null;
    }

    // Try to find a match for language and gender
    let voice = voices.find(v => 
      v.lang.includes(preferredLang.slice(0, 2)) && 
      v.name.toLowerCase().includes(preferredGender)
    );

    // If no match, try just language
    if (!voice) {
      voice = voices.find(v => v.lang.includes(preferredLang.slice(0, 2)));
    }

    // Fallback to any English voice
    if (!voice) {
      voice = voices.find(v => v.lang.includes('en'));
    }

    // Last resort: use the first available voice
    return voice || voices[0];
  };

  return {
    speak: (text, options = {}) => {
      // Cancel any ongoing speech
      synth.cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      const voice = getBestVoice(options.language, options.gender);
      if (voice) {
        utterance.voice = voice;
      }

      // Set other properties
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Set callbacks
      utterance.onend = () => {
        if (options.onEnd) {
          options.onEnd();
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (options.onError) {
          options.onError(event);
        }
      };

      // Store current utterance
      currentUtterance = utterance;

      // Start speaking
      synth.speak(utterance);
    },
    
    cancel: () => {
      synth.cancel();
      currentUtterance = null;
    }
  };
};
