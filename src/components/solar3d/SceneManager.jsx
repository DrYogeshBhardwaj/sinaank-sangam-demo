import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Lighting from './Lighting.jsx';
import CameraManager from './CameraManager.jsx';
import Sun from './bodies/Sun.jsx';
import CelestialBody from './bodies/CelestialBody.jsx';
import OrbitRenderer from './bodies/OrbitRenderer.jsx';

// Data for Milestone 2.2 scope
const INNER_PLANETS = [
  { name: 'Mercury', color: '#9ca3af' },
  { name: 'Venus', color: '#eab308' },
  { name: 'Mars', color: '#ef4444' },
  { name: 'Earth', color: '#3b82f6' }
];

/**
 * SceneManager (Version 2.0)
 * Controls Global Rendering, Time propagation, and Camera.
 * Planets must NEVER control global scene behavior.
 */
export default function SceneManager({ data, cameraMode, scaleMode, selectedPlanet, isSkyView, onSelectPlanet }) {
  // If we are not in sky view, we don't render the 3D scene (Renderer Independence rule)
  // But App.jsx already handles unmounting, so this component acts as the 3D root.

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Canvas 
        camera={{ position: [0, 50, 100], fov: 45 }}
        gl={{ antialias: true, alpha: false, toneMappingExposure: 1.2 }}
        shadows
      >
        {/* Pure Deep Space Background */}
        <color attach="background" args={['#000000']} />
        
        {/* Soft Galaxy Haze (instead of heavy fog) */}
        <fogExp2 attach="fog" args={['#020205', 0.001]} />

        <Suspense fallback={null}>
          <Lighting />
          
          <CameraManager 
            cameraMode={cameraMode} 
            scaleMode={scaleMode} 
            selectedPlanet={selectedPlanet}
            sceneData={data} 
          />

          {/* Premium Starfield */}
          <Stars radius={200} depth={100} count={10000} factor={6} saturation={0.8} fade speed={0.5} />
          
          {/* Hero Object: The Sun */}
          <Sun position={[0, 0, 0]} />

          {/* Inner Planets & Orbits */}
          {INNER_PLANETS.map((planet) => {
            const planetData = data && data.planets ? data.planets[planet.name] : null;
            const distanceAU = planetData ? planetData.distance : null;
            const isSelected = selectedPlanet === planet.name;

            return (
              <group key={planet.name}>
                <OrbitRenderer 
                  distanceAU={distanceAU} 
                  color={planet.color} 
                  isSelected={isSelected}
                />
                <CelestialBody 
                  name={planet.name}
                  color={planet.color}
                  data={data?.planets}
                  selectedPlanet={selectedPlanet}
                  onSelectPlanet={onSelectPlanet}
                />
              </group>
            );
          })}

          {/* Post-Processing for Bloom, Heat Aura, and Vignette */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.4} 
              luminanceSmoothing={0.9} 
              height={300} 
              intensity={2.5} 
            />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
