import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { getVisualOrbitRadius, getVisualPlanetSize, getCartesianCoordinates } from '../../../utils/scaling.js';
import * as THREE from 'three';

export default function CelestialBody({ 
  name, 
  color, 
  data, 
  selectedPlanet, 
  onSelectPlanet 
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const isSelected = selectedPlanet === name;
  const isLabelVisible = hovered || isSelected;

  const visualSize = useMemo(() => getVisualPlanetSize(name), [name]);

  useFrame(() => {
    if (!meshRef.current || !data || !data[name]) return;
    
    // 1. Get raw astronomical data
    const planetData = data[name];
    const distanceAU = planetData.distance || 1.0;
    const longitude = planetData.longitude || 0;
    
    // 2. Convert to Visual Orbit Scale
    const visualRadius = getVisualOrbitRadius(distanceAU);
    
    // 3. Convert to Cartesian Coordinates
    const { x, y, z } = getCartesianCoordinates(longitude, visualRadius);
    
    // 4. Update Position Smoothly (or instantly)
    // Instant update here because 'data' updates 10-60 times a second depending on anim speed.
    meshRef.current.position.set(x, y, z);
    
    // 5. Apply axial rotation (visual only for now)
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <group>
      <Sphere 
        ref={meshRef} 
        args={[visualSize, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPlanet(name);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isSelected ? 0.6 : (hovered ? 0.4 : 0.1)}
          roughness={0.7}
          metalness={0.1}
        />
        
        {/* Planet Label */}
        <Html 
          distanceFactor={50} 
          style={{ 
            transition: 'all 0.2s', 
            opacity: isLabelVisible ? 1 : 0, 
            pointerEvents: 'none' 
          }}
          center
        >
          <div style={{
            color: '#fff',
            background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.5)',
            border: `1px solid ${color}`,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'sans-serif',
            backdropFilter: 'blur(4px)',
            transform: 'translate3d(0, -30px, 0)'
          }}>
            {name}
          </div>
        </Html>
      </Sphere>
    </group>
  );
}
