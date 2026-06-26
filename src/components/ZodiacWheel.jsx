import React, { useState, useEffect } from 'react';
import { planetDetails, translations } from '../i18n.js';
import PlanetDrawer from './PlanetDrawer.jsx';

const ZODIAC_SIGNS = [
  { name: "Aries", nameHi: "मेष", symbol: "♈", color: "#f87171" },
  { name: "Taurus", nameHi: "वृषभ", symbol: "♉", color: "#fbbf24" },
  { name: "Gemini", nameHi: "मिथुन", symbol: "♊", color: "#34d399" },
  { name: "Cancer", nameHi: "कर्क", symbol: "♋", color: "#60a5fa" },
  { name: "Leo", nameHi: "सिंह", symbol: "♌", color: "#fb7185" },
  { name: "Virgo", nameHi: "कन्या", symbol: "का", color: "#a78bfa" },
  { name: "Libra", nameHi: "तुला", symbol: "♎", color: "#f472b6" },
  { name: "Scorpio", nameHi: "वृश्चिक", symbol: "♏", color: "#ef4444" },
  { name: "Sagittarius", nameHi: "धनु", symbol: "♐", color: "#f59e0b" },
  { name: "Capricorn", nameHi: "मकर", symbol: "♑", color: "#6b7280" },
  { name: "Aquarius", nameHi: "कुंभ", symbol: "♒", color: "#06b6d4" },
  { name: "Pisces", nameHi: "मीन", symbol: "♓", color: "#3b82f6" }
];

const PLANET_METADATA = {
  Sun: { label: "SU", symbol: "☀️", color: "var(--color-sun)", radius: 195 },
  Moon: { label: "MO", symbol: "🌙", color: "var(--color-moon)", radius: 75 },
  Mercury: { label: "ME", symbol: "☿", color: "var(--color-mercury)", radius: 100 },
  Venus: { label: "VE", symbol: "♀", color: "var(--color-venus)", radius: 125 },
  Mars: { label: "MA", symbol: "♂", color: "var(--color-mars)", radius: 150 },
  Jupiter: { label: "JU", symbol: "♃", color: "var(--color-jupiter)", radius: 170 },
  Saturn: { label: "SA", symbol: "♄", color: "var(--color-saturn)", radius: 220 },
  Rahu: { label: "RA", symbol: "☊", color: "var(--color-node)", radius: 240 },
  Ketu: { label: "KE", symbol: "☋", color: "var(--color-node)", radius: 240 },
  Uranus: { label: "UR", symbol: "♅", color: "var(--color-uranus)", radius: 260 },
  Neptune: { label: "NE", symbol: "♆", color: "var(--color-neptune)", radius: 280 },
  Pluto: { label: "PL", symbol: "♇", color: "var(--color-pluto)", radius: 300 }
};

export default function ZodiacWheel({ data, selectedPlanet, onSelectPlanet, lang = 'en', labelMode = 'auto' }) {
  const [introFinished, setIntroFinished] = useState(false);
  const [activeTab, setActiveTab] = useState('astronomy'); // 'astronomy', 'vedic', 'sinaank', 'research'

  const t = translations[lang];
  const pData = planetDetails[lang];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 4500); // Intro sequence duration
    return () => clearTimeout(timer);
  }, []);

  if (!data) return <div className="loading-wheel">{t.loadingWheel}</div>;

  const CX = 400;
  const CY = 400;
  
  // Angle translation helper: 0 deg Aries starts at left (180 deg) and moves counter-clockwise
  const getCoords = (longitude, radius) => {
    const angleRad = (180 + longitude) * (Math.PI / 180);
    const x = CX + radius * Math.cos(angleRad);
    const y = CY - radius * Math.sin(angleRad);
    return { x, y };
  };

  // Sign division lines
  const divisionLines = [];
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const inner = getCoords(angle, 60);
    const outer = getCoords(angle, 350);
    divisionLines.push({ id: i, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y });
  }

  // House division lines
  const houseLines = [];
  if (data.cusps && data.cusps.length === 12) {
    data.cusps.forEach((cuspLon, idx) => {
      const inner = getCoords(cuspLon, 60);
      const outer = getCoords(cuspLon, 350);
      const labelPos = getCoords(cuspLon + 2, 100); // slightly offset for the number
      houseLines.push({ 
        id: idx + 1, 
        x1: inner.x, y1: inner.y, 
        x2: outer.x, y2: outer.y,
        labelX: labelPos.x, labelY: labelPos.y
      });
    });
  }

  // Live Degree Ring (Second outer ring: radius 350 to 370)
  const degreeRingTicks = [];
  for (let i = 0; i < 360; i++) {
    const isMajor = i % 10 === 0;
    const isFive = i % 5 === 0;
    const len = isMajor ? 16 : (isFive ? 10 : 5);
    const inner = getCoords(i, 350);
    const outer = getCoords(i, 350 + len);
    
    let isPlanetDegree = false;
    let planetColor = "rgba(255,255,255,0.15)";
    
    Object.entries(data.planets).forEach(([name, planet]) => {
      const meta = PLANET_METADATA[name];
      if (!meta) return;
      const diff = Math.abs(planet.longitude - i);
      if (diff < 0.5) {
        isPlanetDegree = true;
        planetColor = meta.color;
      }
    });

    degreeRingTicks.push({
      id: i,
      x1: inner.x,
      y1: inner.y,
      x2: outer.x,
      y2: outer.y,
      color: isPlanetDegree ? planetColor : (isMajor ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"),
      strokeWidth: isPlanetDegree ? 2 : (isMajor ? 1.5 : 1),
      glow: isPlanetDegree
    });
  }

  // Label degrees on outer edge
  const degreeLabels = [];
  for (let i = 0; i < 360; i += 30) {
    const pos = getCoords(i, 375);
    degreeLabels.push({ value: `${i}°`, x: pos.x, y: pos.y, angle: i });
  }

  // Zodiac Sign texts
  const signTexts = ZODIAC_SIGNS.map((sign, index) => {
    const midAngle = index * 30 + 15;
    const pos = getCoords(midAngle, 335);
    const rotation = 90 - midAngle;
    return {
      name: lang === 'hi' ? sign.nameHi : sign.name,
      symbol: sign.symbol,
      color: sign.color,
      x: pos.x,
      y: pos.y,
      rotation
    };
  });

  // Align day/night terminator of Earth with the Sun's geocentric position
  const sunLon = data.planets.Sun ? data.planets.Sun.longitude : 0;
  const shadowRotation = sunLon;

  const currentDesc = PLANET_METADATA[selectedPlanet] || { color: '#3b82f6' };
  const selectedInfo = pData[selectedPlanet] || pData.Sun;

  // Format sign labels based on selected body
  const getSelectedSignLabel = () => {
    if (selectedPlanet === 'Earth') return lang === 'hi' ? "केंद्र (Station)" : "Geocenter";
    const bodyDetails = data.planets[selectedPlanet];
    if (!bodyDetails) return "";
    const signIdx = ZODIAC_SIGNS.findIndex(s => s.name === bodyDetails.sign);
    return signIdx !== -1 
      ? (lang === 'hi' ? ZODIAC_SIGNS[signIdx].nameHi : ZODIAC_SIGNS[signIdx].name)
      : bodyDetails.sign;
  };

  return (
    <div className={`zodiac-wheel-layout ${introFinished ? 'intro-done' : 'intro-active'}`}>
      
      {/* 360° Circular Zodiac Wheel */}
      <div className="wheel-visualizer glass-panel">
        <svg viewBox="0 0 800 800" className="hero-svg">
          <defs>
            <radialGradient id="space-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d102c" stopOpacity="1" />
              <stop offset="70%" stopColor="#060718" stopOpacity="1" />
              <stop offset="100%" stopColor="#02030a" stopOpacity="1" />
            </radialGradient>
            
            <clipPath id="earth-clip">
              <circle cx="0" cy="0" r="22" />
            </clipPath>
            
            <linearGradient id="earth-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="30%" stopColor="#000" stopOpacity="0" />
              <stop offset="75%" stopColor="#000" stopOpacity="0.85" />
            </linearGradient>

            <filter id="glow-heavy" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.13   0 0 0 0 0.8   0 0 0 0 0.9   0 0 0 1 0" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Outer Ring Space */}
          <circle cx={CX} cy={CY} r="390" fill="#03040b" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r="350" fill="url(#space-grad)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

          {/* Ticks on Live Degree Ring */}
          <g className="degree-ring">
            {degreeRingTicks.map(tick => (
              <line
                key={`tick-${tick.id}`}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={tick.color}
                strokeWidth={tick.strokeWidth}
                filter={tick.glow ? "url(#glow-heavy)" : "none"}
                opacity={tick.glow ? 1 : 0.4}
              />
            ))}
          </g>

          {/* Outer Ring Degree Ticks */}
          <g className="degree-labels">
            {degreeLabels.map(label => (
              <text
                key={`lbl-${label.angle}`}
                x={label.x}
                y={label.y}
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${label.angle - 90}, ${label.x}, ${label.y})`}
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {label.value}
              </text>
            ))}
          </g>

          {/* Planet Orbit Lines */}
          {Object.entries(PLANET_METADATA).map(([name, meta]) => (
            <circle
              key={`orbit-${name}`}
              cx={CX}
              cy={CY}
              r={meta.radius}
              fill="none"
              stroke={selectedPlanet === name ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.015)"}
              strokeWidth={selectedPlanet === name ? 1.5 : 0.8}
            />
          ))}

          {/* Sign boundaries */}
          <g className="zodiac-boundaries">
            {divisionLines.map(line => (
              <line
                key={`div-${line.id}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* House boundaries */}
          <g className="house-boundaries">
            {houseLines.map(line => (
              <g key={`house-${line.id}`}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={line.labelX}
                  y={line.labelY}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {line.id}
                </text>
              </g>
            ))}
          </g>

          {/* Zodiac Signs */}
          <g className="zodiac-symbols">
            {signTexts.map((sign, idx) => (
              <g key={`sign-${idx}`} transform={`translate(${sign.x}, ${sign.y}) rotate(${sign.rotation})`}>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={sign.color}
                  fontSize="12"
                  fontWeight="bold"
                  opacity="0.85"
                  style={{ cursor: 'default', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}
                >
                  {sign.symbol} {sign.name}
                </text>
              </g>
            ))}
          </g>

          {/* Ascendant Line and MC Line */}
          {data.mc && (
            (() => {
              const pos = getCoords(data.mc.longitude, 350);
              return (
                <g className="mc-marker">
                  <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx={pos.x} cy={pos.y} r="4" fill="#f43f5e" />
                </g>
              );
            })()
          )}

          {data.ascendant && (
            (() => {
              const pos = getCoords(data.ascendant.longitude, 350);
              return (
                <g className="asc-marker">
                  <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke="var(--color-asc)" strokeWidth="2" filter="url(#glow-heavy)" />
                  <circle cx={pos.x} cy={pos.y} r="5" fill="var(--color-asc)" />
                  <text x={pos.x} y={pos.y - 12} fill="var(--color-asc)" fontSize="11" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 0 5px #000' }}>
                    ASC
                  </text>
                </g>
              );
            })()
          )}

          {/* Realistic Rotating Earth at Center (Interactive) */}
          <g className="earth-group" onClick={() => onSelectPlanet('Earth')} style={{ cursor: 'pointer' }}>
            <circle cx={CX} cy={CY} r="28" fill="none" stroke={selectedPlanet === 'Earth' ? '#fff' : '#22d3ee'} strokeWidth={selectedPlanet === 'Earth' ? 3 : 2} filter="url(#glow-cyan)" opacity="0.9" />
            <circle cx={CX} cy={CY} r="22" fill="#1d4ed8" />
            
            <g clipPath="url(#earth-clip)" transform={`translate(${CX}, ${CY})`}>
              <g className="earth-continents">
                <path d="M-40 -12 Q-20 -18 0 -12 T40 -12 T80 -12 L80 8 Q40 14 0 8 T-40 8 Z M-20 6 Q0 0 20 6 T60 6 T100 6 L100 -4 Q60 -10 20 -4 T-20 -4 Z" fill="#10b981" opacity="0.8" />
                <path d="M-120 -12 Q-100 -18 -80 -12 T-40 -12 T0 -12 L0 8 Q-40 14 -80 8 T-120 8 Z M-100 6 Q-80 0 -60 6 T-20 6 T20 6 L20 -4 Q-20 -10 -60 -4 T-100 -4 Z" fill="#10b981" opacity="0.8" />
              </g>
            </g>

            <g transform={`translate(${CX}, ${CY}) rotate(${shadowRotation})`}>
              <circle cx="0" cy="0" r="22" fill="url(#earth-shadow)" />
            </g>
          </g>

          {/* Planet Nodes */}
          {Object.entries(data.planets).map(([name, planet]) => {
            const meta = PLANET_METADATA[name];
            if (!meta) return null;
            
            const pos = getCoords(planet.longitude, meta.radius);
            const isSelected = selectedPlanet === name;

            let selectedGlowLine = null;
            if (isSelected) {
              const outerPos = getCoords(planet.longitude, 350);
              selectedGlowLine = (
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={outerPos.x}
                  y2={outerPos.y}
                  stroke={meta.color}
                  strokeWidth="1.5"
                  strokeDasharray="2 4"
                  opacity="0.6"
                />
              );
            }

            return (
              <g
                key={`node-${name}`}
                className={`planet-node-g p-${name.toLowerCase()}`}
                onClick={() => onSelectPlanet(name)}
              >
                {selectedGlowLine}

                <line
                  x1={CX}
                  y1={CY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={meta.color}
                  strokeWidth={isSelected ? 1 : 0.3}
                  opacity={isSelected ? 0.3 : 0.08}
                />
                
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 18 : 13}
                  fill="none"
                  stroke={meta.color}
                  strokeWidth="2"
                  filter={isSelected ? "url(#glow-heavy)" : "none"}
                  opacity={isSelected ? 1 : 0.5}
                />

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 14 : 11}
                  fill="#03040c"
                  stroke={isSelected ? "#fff" : meta.color}
                  strokeWidth="1.5"
                />

                <text
                  x={pos.x}
                  y={pos.y + (isSelected ? 3.5 : 3)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={isSelected ? 10 : 8}
                  fontWeight="bold"
                >
                  {meta.label}
                </text>

                {(labelMode !== 'hidden' || isSelected) && (
                  <text
                    x={pos.x}
                    y={pos.y - (isSelected ? 22 : 17)}
                    fill={meta.color}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ textShadow: '0 0 3px #000' }}
                  >
                    {lang === 'hi' ? (pData[name] ? pData[name].name.split(" ")[0] : name) : name}
                  </text>
                )}

                <text
                  x={pos.x}
                  y={pos.y + (isSelected ? 25 : 20)}
                  fill="rgba(255,255,255,0.7)"
                  fontSize="8"
                  textAnchor="middle"
                  style={{ textShadow: '0 0 3px #000' }}
                >
                  {planet.degree}°
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Planet / Station Details Drawer */}
      <PlanetDrawer data={data} selectedPlanet={selectedPlanet} lang={lang} />

      <style>{`
        .zodiac-wheel-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          width: 100%;
          max-width: 900px;
        }
        
        .wheel-visualizer {
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 10px;
        }

        .hero-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .earth-continents {
          animation: earth-rotate 25s linear infinite;
        }

        @keyframes earth-rotate {
          from { transform: translate(0px, 0); }
          to { transform: translate(-80px, 0); }
        }

        /* Tabs styling */
        .tab-navigation {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 8px;
          flex-wrap: wrap;
        }
        .tab-btn {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 8px 6px;
          font-size: 0.75rem;
          font-weight: bold;
          color: var(--text-secondary);
        }
        .tab-btn:hover {
          background: rgba(255,255,255,0.08);
        }
        .tab-btn.active-tab {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: #fff;
        }
        .tab-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }
        .placeholder-tab-view {
          padding: 30px 10px;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .planet-details-drawer {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .drawer-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .drawer-emoji {
          font-size: 2rem;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sign-badge {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .desc-section {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 12px;
        }
        .desc-heading {
          font-family: var(--font-family-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }
        .astro-desc {
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.5;
        }
        .drawer-specs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255,255,255,0.01);
          border-radius: 8px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.03);
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .spec-row span:first-child {
          color: var(--text-secondary);
        }
        .spec-row span:last-child {
          font-weight: 600;
        }
        .section-divider {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 8px;
          margin-top: 4px;
        }

        /* Moon history timeline stepper */
        .moon-history-section {
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 12px;
        }
        .timeline-stepper {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
          position: relative;
        }
        .timeline-stepper::before {
          content: "";
          position: absolute;
          left: 10px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: rgba(255,255,255,0.05);
        }
        .step-point {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-left: 22px;
          position: relative;
        }
        .step-point::before {
          content: "";
          position: absolute;
          left: 6px;
          top: calc(50% - 5px);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
        }
        .step-point.active-point::before {
          background: var(--color-moon);
          box-shadow: 0 0 8px var(--color-moon);
        }
        .step-time-lbl {
          font-size: 0.8rem;
          color: var(--text-secondary);
          width: 80px;
        }
        .step-pos {
          font-size: 0.85rem;
          font-weight: bold;
        }

        /* Cinematic Intro Staggered Animations */
        .intro-active .degree-ring,
        .intro-active .degree-labels,
        .intro-active .zodiac-boundaries,
        .intro-active .zodiac-symbols,
        .intro-active .asc-marker,
        .intro-active .mc-marker {
          opacity: 0;
          animation: fade-in-delay 1.5s forwards;
          animation-delay: 3s;
        }

        .intro-active .planet-node-g {
          opacity: 0;
          animation: fade-in-delay 1.5s forwards;
          animation-delay: 2.2s;
        }

        .intro-active .earth-group {
          animation: scale-up-earth 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .intro-active .wheel-visualizer {
          animation: camera-zoom-in 4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes fade-in-delay {
          to { opacity: 1; }
        }

        @keyframes scale-up-earth {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        @keyframes camera-zoom-in {
          0% {
            transform: scale(0.65);
            filter: blur(12px);
            opacity: 0;
          }
          40% {
            transform: scale(0.7);
            filter: blur(6px);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            filter: blur(0px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
