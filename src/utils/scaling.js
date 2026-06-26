// src/utils/scaling.js

// This utility ensures that the raw Physical Distance from the Astronomical Engine 
// remains pure, while Visual Orbit and Visual Size can be scaled independently for UI.

// Configuration Profile for Milestone 2.2 (Educational / Presentation Mode)
const SCALE_PROFILE = {
  orbitMultiplier: 30, // 1 AU = 30 units
  orbitCompression: 15, // Logarithmic compression factor for outer planets
  basePlanetSize: 0.8, // Earth size reference
};

// Relative visual sizes compared to Earth (1.0)
const PLANET_RELATIVE_SIZES = {
  Mercury: 0.38,
  Venus: 0.95,
  Earth: 1.0,
  Mars: 0.53,
  Jupiter: 3.5, // Compressed from reality (11.2)
  Saturn: 3.0,  // Compressed from reality (9.4)
  Uranus: 2.0,  // Compressed from reality (4.0)
  Neptune: 1.9, // Compressed from reality (3.8)
  Pluto: 0.2,   // Compressed
};

/**
 * Converts physical AU to a visually pleasing orbit distance using logarithmic compression.
 * @param {number} distanceAU - Raw physical distance from the engine.
 * @returns {number} Visual radius in 3D scene units.
 */
export function getVisualOrbitRadius(distanceAU) {
  if (!distanceAU) return 0;
  // Use a slight logarithmic compression for distances > 1 AU
  if (distanceAU <= 1.5) {
    return distanceAU * SCALE_PROFILE.orbitMultiplier;
  }
  // For larger distances, compress logarithmically
  return (1.5 * SCALE_PROFILE.orbitMultiplier) + 
         (Math.log10(distanceAU) * SCALE_PROFILE.orbitMultiplier * SCALE_PROFILE.orbitCompression);
}

/**
 * Returns the recognizable visual size for a given planet.
 * @param {string} planetName 
 * @returns {number} Radius for the 3D sphere geometry.
 */
export function getVisualPlanetSize(planetName) {
  const relative = PLANET_RELATIVE_SIZES[planetName] || 0.5;
  return relative * SCALE_PROFILE.basePlanetSize;
}

/**
 * Converts polar coordinates (longitude, radius) to Cartesian coordinates (x, y, z).
 * Note: Three.js uses Right-Handed coordinates. X is right, Z is forward/back, Y is up.
 * Assuming Solar System lies roughly on XZ plane.
 * @param {number} longitude - Heliocentric longitude in degrees.
 * @param {number} visualRadius - Radius in 3D scene units.
 * @returns {THREE.Vector3} Object {x, y, z}
 */
export function getCartesianCoordinates(longitude, visualRadius) {
  // 0 degrees longitude is typically +X in astronomy standard, moving counter-clockwise
  const rad = longitude * (Math.PI / 180);
  const x = Math.cos(rad) * visualRadius;
  const z = -Math.sin(rad) * visualRadius; // Negative because WebGL Z goes "into" the screen
  return { x, y: 0, z };
}
