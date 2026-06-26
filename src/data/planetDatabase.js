export const PLANET_DATABASE = {
  SUN: {
    id: "SUN",
    type: "Star",
    symbol: "☀️",
    color: "#fbbf24",
    research: {
      physicalDiameter: "1,392,700 km",
      meanDistance: "0 km (Center of Solar System)",
      orbitalPeriod: "N/A (Galactic Orbit ~230M years)",
      rotationPeriod: "27 Days (Equatorial)",
      axialTilt: "7.25°",
      interestingFacts: ["Contains 99.86% of the mass in the Solar System.", "Surface temperature is about 5,500 °C."]
    }
  },
  MOON: {
    id: "MOON",
    type: "Satellite",
    symbol: "🌙",
    color: "#e5e7eb",
    research: {
      physicalDiameter: "3,474 km",
      meanDistance: "384,400 km from Earth",
      orbitalPeriod: "27.3 Days",
      rotationPeriod: "27.3 Days (Tidally Locked)",
      axialTilt: "1.54°",
      interestingFacts: ["The Moon is moving away from Earth at a rate of 3.8 cm per year.", "It is the fifth-largest natural satellite in the Solar System."]
    }
  },
  EARTH: {
    id: "EARTH",
    type: "Planet",
    symbol: "🌍",
    color: "#3b82f6",
    research: {
      physicalDiameter: "12,742 km",
      meanDistance: "149,597,870 km (1 AU)",
      orbitalPeriod: "365.25 Days",
      rotationPeriod: "23h 56m 4s",
      axialTilt: "23.44°",
      interestingFacts: ["The only known planet to harbor life.", "Earth's core is as hot as the surface of the Sun."]
    }
  },
  MERCURY: {
    id: "MERCURY",
    type: "Planet",
    symbol: "☿",
    color: "#9ca3af",
    research: {
      physicalDiameter: "4,880 km",
      meanDistance: "57.91 million km (0.39 AU)",
      orbitalPeriod: "88 Days",
      rotationPeriod: "58.6 Days",
      axialTilt: "0.034°",
      interestingFacts: ["Mercury is the fastest planet, traveling at ~47 km/s.", "It has a highly eccentric orbit, causing extreme temperature variations."]
    }
  },
  VENUS: {
    id: "VENUS",
    type: "Planet",
    symbol: "♀",
    color: "#fca5a5",
    research: {
      physicalDiameter: "12,104 km",
      meanDistance: "108.2 million km (0.72 AU)",
      orbitalPeriod: "225 Days",
      rotationPeriod: "243 Days (Retrograde)",
      axialTilt: "177.3°",
      interestingFacts: ["Venus rotates in the opposite direction to most planets.", "It is the hottest planet due to a runaway greenhouse effect."]
    }
  },
  MARS: {
    id: "MARS",
    type: "Planet",
    symbol: "♂",
    color: "#ef4444",
    research: {
      physicalDiameter: "6,779 km",
      meanDistance: "227.9 million km (1.52 AU)",
      orbitalPeriod: "687 Days",
      rotationPeriod: "24h 37m",
      axialTilt: "25.19°",
      interestingFacts: ["Home to Olympus Mons, the largest volcano in the Solar System.", "Mars has two tiny moons: Phobos and Deimos."]
    }
  },
  JUPITER: {
    id: "JUPITER",
    type: "Planet",
    symbol: "♃",
    color: "#f59e0b",
    research: {
      physicalDiameter: "139,820 km",
      meanDistance: "778.5 million km (5.20 AU)",
      orbitalPeriod: "11.86 Years",
      rotationPeriod: "9h 55m",
      axialTilt: "3.13°",
      interestingFacts: ["Jupiter has over 90 known moons.", "The Great Red Spot is a giant storm larger than Earth."]
    }
  },
  SATURN: {
    id: "SATURN",
    type: "Planet",
    symbol: "♄",
    color: "#d97706",
    research: {
      physicalDiameter: "116,460 km",
      meanDistance: "1.43 billion km (9.58 AU)",
      orbitalPeriod: "29.45 Years",
      rotationPeriod: "10h 33m",
      axialTilt: "26.73°",
      interestingFacts: ["Its spectacular ring system is made mostly of ice particles.", "Saturn is less dense than water; it would float in a sufficiently large ocean."]
    }
  },
  URANUS: {
    id: "URANUS",
    type: "Planet",
    symbol: "♅",
    color: "#0ea5e9",
    research: {
      physicalDiameter: "50,724 km",
      meanDistance: "2.87 billion km (19.22 AU)",
      orbitalPeriod: "84 Years",
      rotationPeriod: "17h 14m (Retrograde)",
      axialTilt: "97.77°",
      interestingFacts: ["Uranus rolls on its side, likely due to a massive ancient collision.", "It has the coldest planetary atmosphere in the Solar System."]
    }
  },
  NEPTUNE: {
    id: "NEPTUNE",
    type: "Planet",
    symbol: "♆",
    color: "#2563eb",
    research: {
      physicalDiameter: "49,244 km",
      meanDistance: "4.50 billion km (30.11 AU)",
      orbitalPeriod: "164.8 Years",
      rotationPeriod: "16h 6m",
      axialTilt: "28.32°",
      interestingFacts: ["Winds on Neptune can reach up to 2,100 km/h, the fastest in the Solar System.", "It was discovered by mathematical prediction rather than empirical observation."]
    }
  },
  PLUTO: {
    id: "PLUTO",
    type: "Dwarf Planet",
    symbol: "♇",
    color: "#6b7280",
    research: {
      physicalDiameter: "2,376 km",
      meanDistance: "5.9 billion km (39.48 AU)",
      orbitalPeriod: "248 Years",
      rotationPeriod: "6.39 Days (Retrograde)",
      axialTilt: "122.53°",
      interestingFacts: ["Reclassified as a dwarf planet in 2006.", "Pluto's moon Charon is so large that they orbit a common center of mass outside both bodies."]
    }
  },
  RAHU: {
    id: "RAHU",
    type: "Lunar Node",
    symbol: "☊",
    color: "#6b7280",
    research: {
      physicalDiameter: "Mathematical Point",
      meanDistance: "Lunar Orbit (~384,400 km)",
      orbitalPeriod: "18.6 Years (Retrograde)",
      rotationPeriod: "N/A",
      axialTilt: "N/A",
      interestingFacts: ["North node of the Moon.", "Represents the ascending point where the Moon crosses the ecliptic."]
    }
  },
  KETU: {
    id: "KETU",
    type: "Lunar Node",
    symbol: "☋",
    color: "#6b7280",
    research: {
      physicalDiameter: "Mathematical Point",
      meanDistance: "Lunar Orbit (~384,400 km)",
      orbitalPeriod: "18.6 Years (Retrograde)",
      rotationPeriod: "N/A",
      axialTilt: "N/A",
      interestingFacts: ["South node of the Moon.", "Always exactly 180° opposite to Rahu on the ecliptic."]
    }
  }
};
