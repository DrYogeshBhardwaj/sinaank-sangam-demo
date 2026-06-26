import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { getVisualOrbitRadius } from '../../../utils/scaling.js';
import * as THREE from 'three';

export default function OrbitRenderer({ distanceAU, color, isSelected }) {
  const points = useMemo(() => {
    if (!distanceAU) return [];
    
    const visualRadius = getVisualOrbitRadius(distanceAU);
    const pts = [];
    const segments = 128; // High resolution for smooth circle
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      // Solar system is on XZ plane
      pts.push(new THREE.Vector3(
        Math.cos(theta) * visualRadius,
        0,
        -Math.sin(theta) * visualRadius
      ));
    }
    return pts;
  }, [distanceAU]);

  if (points.length === 0) return null;

  return (
    <Line 
      points={points} 
      color={color} 
      lineWidth={isSelected ? 1.5 : 0.8}
      transparent
      opacity={isSelected ? 0.6 : 0.25}
    />
  );
}
