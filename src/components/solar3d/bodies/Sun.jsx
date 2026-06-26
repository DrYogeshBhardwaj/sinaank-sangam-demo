import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

export default function Sun({ position = [0, 0, 0] }) {
  const sunRef = useRef();
  const coronaRef = useRef();

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001; // Slow rotation
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y -= 0.0015;
      coronaRef.current.rotation.x += 0.0005;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      coronaRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      {/* Main Emissive Sun Body */}
      <Sphere ref={sunRef} args={[5, 64, 64]}>
        <meshStandardMaterial 
          color="#ffb142" 
          emissive="#ff793f" 
          emissiveIntensity={2.5} 
          roughness={0.4} 
        />
      </Sphere>

      {/* Corona / Heat Aura */}
      <Sphere ref={coronaRef} args={[5.3, 32, 32]}>
        <meshBasicMaterial 
          color="#ff5252" 
          transparent={true} 
          opacity={0.15} 
          blending={2} 
          depthWrite={false}
        />
      </Sphere>

    </group>
  );
}
