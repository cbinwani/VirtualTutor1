// Digital Human Avatar component for Virtual Tutor application
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSpeechEngine } from '../utils/speechEngine';
import './DigitalHumanAvatar.css';

const DigitalHumanAvatar = ({ 
  avatarId, 
  avatarUrl, 
  message, 
  onAnimationComplete,
  speaking = false,
  emotion = 'neutral'
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const speechEngineRef = useRef(null);
  const animationsRef = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 3);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (mixerRef.current) {
        mixerRef.current.update(0.016); // Update at 60fps
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Initialize speech engine
    speechEngineRef.current = createSpeechEngine();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      
      if (speechEngineRef.current) {
        speechEngineRef.current.cancel();
      }
    };
  }, []);

  // Load avatar model
  useEffect(() => {
    if (!sceneRef.current || !avatarUrl) return;

    setIsLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    
    loader.load(
      avatarUrl,
      (gltf) => {
        // Remove previous model if exists
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }

        const model = gltf.scene;
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.y = -center.y + size.y / 2;
        model.position.z = -center.z;
        
        sceneRef.current.add(model);
        modelRef.current = model;

        // Setup animations
        if (gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          
          gltf.animations.forEach((clip) => {
            animationsRef.current[clip.name] = mixer.clipAction(clip);
          });
          
          // Play idle animation by default
          if (animationsRef.current['idle']) {
            animationsRef.current['idle'].play();
          } else if (animationsRef.current['Idle']) {
            animationsRef.current['Idle'].play();
          } else if (gltf.animations.length > 0) {
            // If no specific idle animation, play the first one
            const defaultAnim = mixer.clipAction(gltf.animations[0]);
            defaultAnim.play();
          }
        }

        setIsLoading(false);
      },
      (xhr) => {
        // Loading progress
        console.log(`${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
      },
      (error) => {
        console.error('Error loading avatar model:', error);
        setError('Failed to load avatar model');
        setIsLoading(false);
      }
    );
  }, [avatarUrl]);

  // Handle speaking state and message changes
  useEffect(() => {
    if (!speechEngineRef.current || !message || !speaking) return;

    // Play talking animation
    if (mixerRef.current && modelRef.current) {
      // Stop current animations
      mixerRef.current.stopAllAction();
      
      // Play talking animation if available
      if (animationsRef.current['talking']) {
        animationsRef.current['talking'].play();
      } else if (animationsRef.current['Talking']) {
        animationsRef.current['Talking'].play();
      } else if (animationsRef.current['speak']) {
        animationsRef.current['speak'].play();
      } else if (animationsRef.current['Speak']) {
        animationsRef.current['Speak'].play();
      } else if (animationsRef.current['idle']) {
        // Fallback to idle animation
        animationsRef.current['idle'].play();
      }
    }

    // Speak the message
    speechEngineRef.current.speak(message, {
      onEnd: () => {
        // Return to idle animation when speech ends
        if (mixerRef.current && modelRef.current) {
          mixerRef.current.stopAllAction();
          
          if (animationsRef.current['idle']) {
            animationsRef.current['idle'].play();
          } else if (animationsRef.current['Idle']) {
            animationsRef.current['Idle'].play();
          }
        }
        
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    });

    return () => {
      speechEngineRef.current.cancel();
    };
  }, [message, speaking, onAnimationComplete]);

  // Handle emotion changes
  useEffect(() => {
    if (!mixerRef.current || !modelRef.current || speaking) return;

    // Only change emotion when not speaking
    mixerRef.current.stopAllAction();
    
    // Map emotion to animation name
    const emotionAnimMap = {
      neutral: ['idle', 'Idle'],
      happy: ['happy', 'Happy', 'smile', 'Smile'],
      sad: ['sad', 'Sad'],
      thinking: ['thinking', 'Thinking'],
      confused: ['confused', 'Confused']
    };
    
    const animOptions = emotionAnimMap[emotion] || emotionAnimMap.neutral;
    
    // Try to find matching animation
    for (const animName of animOptions) {
      if (animationsRef.current[animName]) {
        animationsRef.current[animName].play();
        break;
      }
    }
  }, [emotion, speaking]);

  return (
    <div className="digital-human-container" ref={containerRef}>
      {isLoading && (
        <div className="avatar-loader">
          <div className="loader-spinner"></div>
          <p>Loading avatar...</p>
        </div>
      )}
      
      {error && (
        <div className="avatar-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default DigitalHumanAvatar;
