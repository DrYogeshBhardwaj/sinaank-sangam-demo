import React from 'react';

export default function Lighting() {
  return (
    <>
      {/* Sun Light (Point Source at origin) */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={2.5} 
        distance={2000} 
        decay={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      
      {/* Faint ambient light so dark sides aren't pitch black */}
      <ambientLight intensity={0.03} color="#8899ff" />
    </>
  );
}
