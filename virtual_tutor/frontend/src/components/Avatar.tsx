import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import './Avatar.css';

interface AvatarProps {
  modelUrl: string;
  speaking: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'confused';
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Model: React.FC<{
  modelUrl: string;
  speaking: boolean;
  emotion: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}> = ({ modelUrl, speaking, emotion, scale, position, rotation }) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, names } = useAnimations(animations, group);
  
  // Clone the scene to avoid modifying the cached original
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  useEffect(() => {
    // Handle animations based on speaking state and emotion
    if (speaking) {
      // Play speaking animation if available
      if (names.includes('speaking')) {
        actions['speaking']?.reset().fadeIn(0.5).play();
      }
    } else {
      // Play idle animation if available
      if (names.includes('idle')) {
        actions['idle']?.reset().fadeIn(0.5).play();
      }
    }
    
    // Handle emotion animations
    if (emotion && names.includes(emotion)) {
      actions[emotion]?.reset().fadeIn(0.5).play();
    }
    
    return () => {
      // Cleanup animations
      Object.values(actions).forEach(action => action?.fadeOut(0.5));
    };
  }, [speaking, emotion, actions, names]);
  
  useFrame((_, delta) => {
    // Add subtle movement to make the avatar feel more alive
    if (group.current) {
      group.current.rotation.y += Math.sin(Date.now() * 0.001) * 0.001;
    }
  });
  
  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
};

const Avatar: React.FC<AvatarProps> = ({
  modelUrl,
  speaking = false,
  emotion = 'neutral',
  scale = 1,
  position = [0, -1, 0],
  rotation = [0, 0, 0]
}) => {
  return (
    <div className="avatar-container">
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Model
          modelUrl={modelUrl}
          speaking={speaking}
          emotion={emotion}
          scale={scale}
          position={position}
          rotation={rotation}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - 0.5}
          maxPolarAngle={Math.PI / 2 + 0.5}
        />
      </Canvas>
    </div>
  );
};

export default Avatar;
