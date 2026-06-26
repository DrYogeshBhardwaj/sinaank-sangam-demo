import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { getVisualOrbitRadius, getCartesianCoordinates, getVisualPlanetSize } from '../../utils/scaling.js';

export default function CameraManager({ cameraMode, scaleMode, selectedPlanet, sceneData }) {
  const controlsRef = useRef();

  useEffect(() => {
    if (!controlsRef.current) return;
    
    let target = new THREE.Vector3(0, 0, 0); 
    let pos = new THREE.Vector3(0, 50, 100); 

    // Function to calculate planet position
    const getPlanetTarget = (planetName) => {
      const pData = sceneData?.planets?.[planetName];
      if (pData) {
        const radius = getVisualOrbitRadius(pData.distance);
        const { x, y, z } = getCartesianCoordinates(pData.longitude, radius);
        return new THREE.Vector3(x, y, z);
      }
      return new THREE.Vector3(0, 0, 0);
    };

    if (cameraMode === 'sun') {
      target.set(0, 0, 0);
      pos.set(0, 20, 40);
    } else if (cameraMode === 'earth' || (cameraMode === 'planet' && selectedPlanet === 'Earth')) {
      target.copy(getPlanetTarget('Earth'));
      const earthSize = getVisualPlanetSize('Earth');
      pos.set(target.x + earthSize * 5, target.y + earthSize * 2, target.z + earthSize * 5);
    } else if (cameraMode === 'planet' && selectedPlanet) {
      target.copy(getPlanetTarget(selectedPlanet));
      const size = getVisualPlanetSize(selectedPlanet);
      pos.set(target.x + size * 5, target.y + size * 2, target.z + size * 5);
    } else {
      // 'free' mode
    }

    if (cameraMode !== 'free') {
      controlsRef.current.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, true);
    }
  }, [cameraMode, scaleMode, selectedPlanet, sceneData]);

  return (
    <CameraControls 
      ref={controlsRef} 
      makeDefault 
      minDistance={1} 
      maxDistance={2000} 
      smoothTime={1.5} 
    />
  );
}
