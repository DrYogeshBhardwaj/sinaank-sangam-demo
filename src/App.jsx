import React, { useState, useEffect, useRef } from 'react';
import Controls from './components/Controls.jsx';
import ZodiacWheel from './components/ZodiacWheel.jsx';
import SolarView3D from './components/SolarView3D.jsx';
import PlanetPanel from './components/PlanetPanel.jsx';
import ObservatoryMenu from './components/ObservatoryMenu.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { translations } from './i18n.js';

export default function App() {
  // Localization State
  const [lang, setLang] = useLocalStorage('sinaank_lang', 'hi');

  // View state: true for Heliocentric 3D Solar View, false for Geocentric Zodiac Wheel
  const [isSkyView, setIsSkyView] = useState(window.location.pathname === '/solar3d');
  
  // Persisted HUD Level for Space View
  const [hudLevel, setHudLevel] = useLocalStorage('sinaank_hud_level', 'full');

  const [cameraMode, setCameraMode] = useLocalStorage('sinaank_camera_mode', 'free');
  const [scaleMode, setScaleMode] = useLocalStorage('sinaank_scale_mode', 'planet');
  const [labelMode, setLabelMode] = useLocalStorage('sinaank_label_mode', 'auto');

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // Full Screen Planet Explorer Modal State (Priority 2)
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  // Unified Observatory Menu Trigger
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Contextual transitions for sidebar panel
  useEffect(() => {
    if (isSkyView) {
      setIsLeftPanelOpen(false); // Focus mode default
    } else {
      setIsLeftPanelOpen(true);
    }
  }, [isSkyView]);

  // Keyboard Shortcuts listener
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      
      if (key === 'h') {
        setHudLevel(prev => {
          const levels = ['full', 'presentation', 'minimal', 'cinema'];
          const idx = levels.indexOf(prev);
          return levels[(idx + 1) % levels.length];
        });
      } else if (key === 'c') {
        setHudLevel(prev => prev === 'cinema' ? 'full' : 'cinema');
      } else if (key === 'e') {
        setIsExplorerOpen(prev => !prev);
      } else if (key === 'f') {
        setCameraMode(prev => prev === 'planet' ? 'free' : 'planet');
      } else if (key === 'r') {
        setCameraMode('free');
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);



  // Coordinates default to New Delhi
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.2090);
  const [timezone, setTimezone] = useState(5.5);
  const [sidereal, setSidereal] = useState(true);
  const [nodeOption, setNodeOption] = useState('mean');
  
  // Date State (Defaults to Current Time)
  const [date, setDate] = useState(new Date());
  
  // UI States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState('Sun');
  const [useLiveClock, setUseLiveClock] = useState(true);

  // Playback / Animation States
  const [isAnimPlaying, setIsAnimPlaying] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [animInterval, setAnimInterval] = useState('days');

  const animTimerRef = useRef(null);
  const t = translations[lang];

  // Left panel 10-second inactivity timer in Sky View
  useEffect(() => {
    if (!isSkyView || !isLeftPanelOpen || hudLevel === 'cinema') return;

    const timer = setTimeout(() => {
      setIsLeftPanelOpen(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isSkyView, isLeftPanelOpen, hudLevel, date, lat, lon]);

  // Fetch calculations from Backend
  // Passes heliocentric query flag matching isSkyView
  const fetchPositions = async (targetDate) => {
    try {
      const isoString = targetDate.toISOString();
      const res = await fetch(
        `/api/planets?date=${encodeURIComponent(isoString)}&lat=${lat}&lon=${lon}&sidereal=${sidereal}&node=${nodeOption}&timezone=${timezone}&heliocentric=${isSkyView}`
      );
      if (!res.ok) throw new Error("API call failed");
      const result = await res.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch coordinates:", err);
    }
  };

  useEffect(() => {
    fetchPositions(date);
  }, [date, lat, lon, sidereal, nodeOption, timezone, isSkyView]);

  // Live Clock loop
  useEffect(() => {
    let clockInterval;
    if (useLiveClock && !isAnimPlaying) {
      clockInterval = setInterval(() => {
        setDate(new Date());
      }, 1000);
    }
    return () => clearInterval(clockInterval);
  }, [useLiveClock, isAnimPlaying]);

  // Helper to step date
  const stepDate = (amount, unit, current = date) => {
    const nextDate = new Date(current.getTime());
    
    switch (unit) {
      case 'minutes':
        nextDate.setUTCMinutes(nextDate.getUTCMinutes() + amount);
        break;
      case 'hours':
        nextDate.setUTCHours(nextDate.getUTCHours() + amount);
        break;
      case 'days':
        nextDate.setUTCDate(nextDate.getUTCDate() + amount);
        break;
      case 'weeks':
        nextDate.setUTCDate(nextDate.getUTCDate() + amount * 7);
        break;
      case 'months':
        nextDate.setUTCMonth(nextDate.getUTCMonth() + amount);
        break;
      case 'years':
        nextDate.setUTCFullYear(nextDate.getUTCFullYear() + amount);
        break;
      default:
        break;
    }
    return nextDate;
  };

  // Manual Step
  const handleStepTime = (direction) => {
    setUseLiveClock(false);
    setDate(prev => stepDate(direction, animInterval, prev));
  };

  // Reset to Current Time
  const handleReset = () => {
    setIsAnimPlaying(false);
    setUseLiveClock(true);
    setDate(new Date());
  };

  // Animation Playback loop
  useEffect(() => {
    if (isAnimPlaying) {
      setUseLiveClock(false);
      
      const intervalMs = 250; // Tick rate
      animTimerRef.current = setInterval(() => {
        setDate(prev => stepDate(animSpeed, animInterval, prev));
      }, intervalMs);
    } else {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
    }

    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
      }
    };
  }, [isAnimPlaying, animSpeed, animInterval]);

  const getLocalTimeString = () => {
    const localTime = new Date(date.getTime() + timezone * 60 * 60 * 1000);
    return localTime.toUTCString().replace("GMT", "");
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="main-header glass-panel">
        <div className="header-logo">
          <span className="logo-symbol">🪐</span>
          <div>
            <h1 style={{ textTransform: 'none' }}>{t.appTitle}</h1>
            <p className="subtitle font-mono">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="header-controls">
          
          {/* Unified ☰ Observatory Menu Toggle */}
          <div className="observatory-menu-container" style={{ position: 'relative' }}>
            <button 
              className={`menu-trigger-btn ${isMenuOpen ? 'active-menu' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '1.4rem',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
            >
              ☰
            </button>
            
            <ObservatoryMenu 
              isMenuOpen={isMenuOpen} 
              setIsMenuOpen={setIsMenuOpen}
              isSkyView={isSkyView}
              setIsSkyView={setIsSkyView}
              cameraMode={cameraMode}
              setCameraMode={setCameraMode}
              hudLevel={hudLevel}
              setHudLevel={setHudLevel}
              labelMode={labelMode}
              setLabelMode={setLabelMode}
              isExplorerOpen={isExplorerOpen}
              setIsExplorerOpen={setIsExplorerOpen}
              isLeftPanelOpen={isLeftPanelOpen}
              setIsLeftPanelOpen={setIsLeftPanelOpen}
              handleFullscreenToggle={handleFullscreenToggle}
            />
          </div>

          {/* Language selection */}
          <div className="lang-toggle-container">
            <button 
              onClick={() => setLang('hi')} 
              className={`lang-btn ${lang === 'hi' ? 'active-lang' : ''}`}
            >
              🇮🇳 हिन्दी
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`lang-btn ${lang === 'en' ? 'active-lang' : ''}`}
            >
              🇬🇧 English
            </button>
          </div>

          <div className="clock-status-widget">
            <div className="time-display">
              <span className="time-val font-mono">{getLocalTimeString()}</span>
              <span className="tz-label">{t.selectedLocaleTime}</span>
            </div>
            <div className={`status-badge ${useLiveClock ? 'live' : 'time-machine'}`}>
              <span className="status-dot"></span>
              {useLiveClock ? t.liveClock : t.timeMachine}
            </div>
            {!useLiveClock && (
              <button className="live-btn" onClick={handleReset}>
                {t.goLive}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      {isSkyView ? (
        <div className="solar-observatory-layout">
          {loading && !data ? (
            <div className="loader glass-panel">{t.aligningConstellations}</div>
          ) : (
            <SolarView3D
              data={data}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={setSelectedPlanet}
              lang={lang}
              hudLevel={hudLevel}
              setHudLevel={setHudLevel}
              isLeftPanelOpen={isLeftPanelOpen}
              setIsLeftPanelOpen={setIsLeftPanelOpen}
              isExplorerOpen={isExplorerOpen}
              setIsExplorerOpen={setIsExplorerOpen}
              onExitSkyView={() => setIsSkyView(false)}
              cameraMode={cameraMode}
              setCameraMode={setCameraMode}
              scaleMode={scaleMode}
              setScaleMode={setScaleMode}
              labelMode={labelMode}
              setLabelMode={setLabelMode}
            />
          )}

          {/* Left edge mouse trigger boundary */}
          {isSkyView && !isLeftPanelOpen && hudLevel === 'full' && (
            <div 
              className="left-edge-hover-trigger"
              onMouseEnter={() => setIsLeftPanelOpen(true)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '15px',
                zIndex: 9999,
                cursor: 'pointer'
              }}
            />
          )}

          {/* Floating UI Overlay Panels */}
          {hudLevel === 'full' && isLeftPanelOpen && (
            <div className="solar-overlay-left floating-panel glass-panel">
              <Controls
                date={date}
                setDate={(d) => {
                  setUseLiveClock(false);
                  setDate(d);
                }}
                lat={lat}
                setLat={(l) => {
                  setUseLiveClock(false);
                  setLat(l);
                }}
                lon={lon}
                setLon={(ln) => {
                  setUseLiveClock(false);
                  setLon(ln);
                }}
                timezone={timezone}
                setTimezone={setTimezone}
                sidereal={sidereal}
                setSidereal={setSidereal}
                nodeOption={nodeOption}
                setNodeOption={setNodeOption}
                isAnimPlaying={isAnimPlaying}
                setIsAnimPlaying={setIsAnimPlaying}
                animSpeed={animSpeed}
                setAnimSpeed={setAnimSpeed}
                animInterval={animInterval}
                setAnimInterval={setAnimInterval}
                onStepTime={handleStepTime}
                onReset={handleReset}
                lang={lang}
              />
            </div>
          )}

          {/* Floating stats details on the right - Shown only in Full HUD */}
          {hudLevel === 'full' && (
            <div className="solar-overlay-right floating-panel glass-panel">
              <button 
                className="explore-full-screen-btn"
                onClick={() => setIsExplorerOpen(true)}
              >
                📊 {t.showTable}
              </button>
              <div style={{ marginTop: '16px', width: '100%', overflowY: 'auto', flex: 1 }}>
                {!loading && data && (
                  <PlanetPanel
                    data={data}
                    selectedPlanet={selectedPlanet}
                    onSelectPlanet={setSelectedPlanet}
                    lang={lang}
                  />
                )}
              </div>
            </div>
          )}

          {/* Floating Settings Gear toggle button for Left Controls Panel */}
          {hudLevel === 'full' && (
            <button
              className="observatory-controls-toggle glass-panel"
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              style={{
                position: 'absolute',
                left: '20px',
                bottom: '20px',
                zIndex: 1000,
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(13, 15, 33, 0.85)',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              ⚙️
            </button>
          )}

          {/* Context-aware HUD Level cyclic selector in the bottom center */}
          {hudLevel !== 'cinema' && (
            <div 
              className="hud-cycle-container glass-panel"
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(13, 15, 33, 0.85)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.05em' }}>
                HUD:
              </span>
              <button 
                onClick={() => setHudLevel('full')}
                className={`hud-level-choice-btn ${hudLevel === 'full' ? 'active-hud-level' : ''}`}
              >
                Full
              </button>
              <button 
                onClick={() => setHudLevel('presentation')}
                className={`hud-level-choice-btn ${hudLevel === 'presentation' ? 'active-hud-level' : ''}`}
              >
                Demo
              </button>
              <button 
                onClick={() => setHudLevel('minimal')}
                className={`hud-level-choice-btn ${hudLevel === 'minimal' ? 'active-hud-level' : ''}`}
              >
                Min
              </button>
              <button 
                onClick={() => setHudLevel('cinema')}
                className={`hud-level-choice-btn ${hudLevel === 'cinema' ? 'active-hud-level' : ''}`}
              >
                Cinema
              </button>
            </div>
          )}
        </div>
      ) : (
        <main className="dashboard-grid">
          {/* Left column: Time and location settings */}
          <div className="grid-left">
            <Controls
              date={date}
              setDate={(d) => {
                setUseLiveClock(false);
                setDate(d);
              }}
              lat={lat}
              setLat={(l) => {
                setUseLiveClock(false);
                setLat(l);
              }}
              lon={lon}
              setLon={(ln) => {
                setUseLiveClock(false);
                setLon(ln);
              }}
              timezone={timezone}
              setTimezone={setTimezone}
              sidereal={sidereal}
              setSidereal={setSidereal}
              nodeOption={nodeOption}
              setNodeOption={setNodeOption}
              isAnimPlaying={isAnimPlaying}
              setIsAnimPlaying={setIsAnimPlaying}
              animSpeed={animSpeed}
              setAnimSpeed={setAnimSpeed}
              animInterval={animInterval}
              setAnimInterval={setAnimInterval}
              onStepTime={handleStepTime}
              onReset={handleReset}
              lang={lang}
            />
          </div>

          {/* Middle column: Visualizer - THE HERO (Zodiac Wheel) */}
          <div className="grid-center">
            {loading && !data ? (
              <div className="loader glass-panel">{t.aligningConstellations}</div>
            ) : (
              <ZodiacWheel
                data={data}
                selectedPlanet={selectedPlanet}
                onSelectPlanet={setSelectedPlanet}
                lang={lang}
                labelMode={labelMode}
              />
            )}
          </div>

          {/* Right column: Stats and database explorer shortcut panel */}
          <div className="grid-right">
            <button 
              className="explore-full-screen-btn"
              onClick={() => setIsExplorerOpen(true)}
            >
              📊 {t.showTable}
            </button>

            {/* Quick specs preview */}
            <div style={{ marginTop: '16px', width: '100%' }}>
              {!loading && data && (
                <PlanetPanel
                  data={data}
                  selectedPlanet={selectedPlanet}
                  onSelectPlanet={setSelectedPlanet}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </main>
      )}

      {/* Full-Screen Planet Explorer Modal */}
      {isExplorerOpen && (
        <div className="explorer-modal-overlay">
          <div className="explorer-modal-content glass-panel">
            <div className="explorer-modal-header">
              <h2>📊 {t.tableTitle}</h2>
              <button 
                className="explorer-close-btn"
                onClick={() => setIsExplorerOpen(false)}
              >
                ✖
              </button>
            </div>
            
            {/* Embedded Planet Table Explorer */}
            <div className="explorer-modal-body">
              {!loading && data && (
                <PlanetPanel
                  data={data}
                  selectedPlanet={selectedPlanet}
                  onSelectPlanet={(name) => {
                    setSelectedPlanet(name);
                    setIsExplorerOpen(false); // Auto close on select
                  }}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!isSkyView && (
        <footer className="dashboard-footer">
          <p>{t.footerText}</p>
        </footer>
      )}

      <style>{`
        .app-container {
          max-width: 1500px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-height: 100vh;
        }
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-symbol {
          font-size: 2.5rem;
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
        .header-logo h1 {
          font-size: 1.5rem;
          letter-spacing: 0.15em;
          background: linear-gradient(to right, #fff, var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-controls {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .sky-toggle-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-weight: bold;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .sky-toggle-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 0 12px rgba(99,102,241,0.25);
        }
        .sky-toggle-btn.active-sky {
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          border-color: #22d3ee;
          box-shadow: 0 0 15px rgba(6,182,212,0.4);
          text-shadow: 0 0 5px rgba(255,255,255,0.3);
        }

        .lang-toggle-container {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 3px;
        }
        .lang-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: 18px;
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .lang-btn.active-lang {
          background: var(--accent-color);
          color: #fff;
          box-shadow: 0 0 10px rgba(99,102,241,0.4);
        }
        .lang-btn:hover:not(.active-lang) {
          color: var(--text-primary);
          background: rgba(255,255,255,0.02);
        }

        .clock-status-widget {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .time-display {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .time-val {
          font-size: 1.1rem;
          font-weight: bold;
          letter-spacing: 0.05em;
        }
        .tz-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          letter-spacing: 0.05em;
        }
        .status-badge.live {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
        }
        .status-badge.live .status-dot {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulse-glow 1.5s infinite;
        }
        .status-badge.time-machine {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #fbbf24;
        }
        .status-badge.time-machine .status-dot {
          background: #fbbf24;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .live-btn {
          font-size: 0.75rem;
          padding: 6px 12px;
          background: var(--accent-color);
          border-radius: 20px;
        }
        .live-btn:hover {
          background: var(--accent-hover);
        }
        
        .menu-trigger-btn:hover, .menu-trigger-btn.active-menu {
          background: rgba(99, 102, 241, 0.2) !important;
          border-color: var(--accent-color) !important;
          box-shadow: 0 0 10px rgba(99,102,241,0.4);
        }
        .menu-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .menu-group-title {
          font-family: var(--font-family-mono);
          font-size: 0.65rem;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          font-weight: bold;
        }
        .menu-group-options {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .menu-group-options button {
          font-size: 0.72rem;
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .menu-group-options button:hover:not(:disabled) {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .menu-group-options button.active-opt {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: #fff;
          box-shadow: 0 0 6px rgba(99,102,241,0.4);
        }

        .solar-observatory-layout {
          position: relative;
          width: 100%;
          height: calc(100vh - 110px);
          margin: 0;
          padding: 0;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid var(--panel-border);
          background: #03040c;
        }
        .floating-panel {
          position: absolute;
          background: rgba(13, 15, 33, 0.85) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          z-index: 10;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .solar-overlay-left {
          top: 20px;
          left: 20px;
          width: 320px;
          max-height: calc(100% - 40px);
          overflow-y: auto;
        }
        .solar-overlay-right {
          top: 20px;
          right: 20px;
          width: 350px;
          max-height: calc(100% - 40px);
          overflow-y: auto;
        }
        
        .hud-level-choice-btn {
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .hud-level-choice-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .hud-level-choice-btn.active-hud-level {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: #fff;
          box-shadow: 0 0 8px rgba(99,102,241,0.5);
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: 310px 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .grid-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .grid-center {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .grid-right {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        /* Full Screen Explorer Button */
        .explore-full-screen-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
          color: #fff;
          font-weight: bold;
          padding: 12px;
          border-radius: 8px;
          border: none;
          box-shadow: 0 0 15px rgba(99,102,241,0.25);
        }
        .explore-full-screen-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }

        /* Full Screen Modal Overlay */
        .explorer-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 5, 14, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 24px;
        }
        .explorer-modal-content {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .explorer-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 14px;
        }
        .explorer-close-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
        }
        .explorer-close-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
        }
        .explorer-modal-body {
          flex: 1;
        }
        
        .loader {
          height: 500px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-family-mono);
          color: var(--text-secondary);
          letter-spacing: 0.05em;
        }
        
        .dashboard-footer {
          margin-top: auto;
          text-align: center;
          padding: 24px 0;
          color: var(--text-muted);
          font-size: 0.8rem;
          border-top: 1px solid rgba(255,255,255,0.03);
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 300px 1fr;
          }
          .grid-right {
            grid-column: span 2;
          }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .grid-right {
            grid-column: auto;
          }
        }
      `}</style>
    </div>
  );
}
