import React from 'react';

export default function ObservatoryMenu({ 
  isMenuOpen, setIsMenuOpen, 
  isSkyView, setIsSkyView,
  cameraMode, setCameraMode,
  hudLevel, setHudLevel,
  labelMode, setLabelMode,
  isExplorerOpen, setIsExplorerOpen,
  isLeftPanelOpen, setIsLeftPanelOpen,
  handleFullscreenToggle 
}) {
  if (!isMenuOpen) return null;

  return (
    <div 
      className="observatory-dropdown-menu glass-panel"
      style={{
        position: 'absolute',
        top: '50px',
        right: '0',
        width: '260px',
        zIndex: 99999,
        background: 'rgba(13, 15, 33, 0.98)',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderRadius: '12px'
      }}
    >
      <div style={{ 
        textAlign: 'center', 
        fontFamily: 'var(--font-family-mono)', 
        fontSize: '0.85rem', 
        fontWeight: 'bold', 
        borderBottom: '1px solid rgba(255,255,255,0.1)', 
        paddingBottom: '8px',
        color: '#fff' 
      }}>
        SINAANK Observatory (v1.0 RC1)
      </div>

      {/* VIEW */}
      <div className="menu-group">
        <span className="menu-group-title">🌍 VIEW</span>
        <div className="menu-group-options" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            onClick={() => { window.location.href = '/'; }}
            className={!isSkyView ? 'active-opt' : ''}
          >
            Planet Wheel (2D)
          </button>
          <button 
            onClick={() => { window.location.href = '/solar3d'; }}
            className={isSkyView ? 'active-opt' : ''}
          >
            Solar System (3D)
          </button>
        </div>
      </div>

      {/* CAMERA */}
      <div className="menu-group">
        <span className="menu-group-title">📷 CAMERA</span>
        <div className="menu-group-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <button onClick={() => { setCameraMode('free'); setIsMenuOpen(false); }} className={cameraMode === 'free' ? 'active-opt' : ''} style={{ flex: '1 0 45%' }}>Free</button>
          <button onClick={() => { setCameraMode('sun'); setIsMenuOpen(false); }} className={cameraMode === 'sun' ? 'active-opt' : ''} style={{ flex: '1 0 45%' }}>Sun</button>
          <button onClick={() => { setCameraMode('earth'); setIsMenuOpen(false); }} className={cameraMode === 'earth' ? 'active-opt' : ''} style={{ flex: '1 0 45%' }}>Earth</button>
          <button onClick={() => { setCameraMode('moon'); setIsMenuOpen(false); }} className={cameraMode === 'moon' ? 'active-opt' : ''} style={{ flex: '1 0 45%' }}>Moon</button>
          <button onClick={() => { setCameraMode('planet'); setIsMenuOpen(false); }} className={cameraMode === 'planet' ? 'active-opt' : ''} style={{ flex: '1 0 100%' }}>Selected Planet</button>
        </div>
      </div>

      {/* DISPLAY */}
      <div className="menu-group">
        <span className="menu-group-title">👁 DISPLAY</span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }}>
          {/* Planet Labels */}
          <div>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontFamily: 'var(--font-family-mono)' }}>Planet Labels</span>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <button onClick={() => { setLabelMode('auto'); setIsMenuOpen(false); }} className={labelMode === 'auto' ? 'active-opt' : ''} style={{ flex: 1, fontSize: '0.62rem', padding: '4px 2px', textAlign: 'center' }}>Auto</button>
              <button onClick={() => { setLabelMode('always'); setIsMenuOpen(false); }} className={labelMode === 'always' ? 'active-opt' : ''} style={{ flex: 1, fontSize: '0.62rem', padding: '4px 2px', textAlign: 'center' }}>Always</button>
              <button onClick={() => { setLabelMode('hidden'); setIsMenuOpen(false); }} className={labelMode === 'hidden' ? 'active-opt' : ''} style={{ flex: 1, fontSize: '0.62rem', padding: '4px 2px', textAlign: 'center' }}>Hidden</button>
            </div>
          </div>
          
          {/* HUD Level */}
          <div>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontFamily: 'var(--font-family-mono)' }}>HUD Level</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
              <button onClick={() => { setHudLevel('full'); setIsMenuOpen(false); }} className={hudLevel === 'full' ? 'active-opt' : ''} style={{ fontSize: '0.65rem', padding: '4px 6px', textAlign: 'center' }}>Full</button>
              <button onClick={() => { setHudLevel('presentation'); setIsMenuOpen(false); }} className={hudLevel === 'presentation' ? 'active-opt' : ''} style={{ fontSize: '0.65rem', padding: '4px 6px', textAlign: 'center' }}>Presentation</button>
              <button onClick={() => { setHudLevel('minimal'); setIsMenuOpen(false); }} className={hudLevel === 'minimal' ? 'active-opt' : ''} style={{ fontSize: '0.65rem', padding: '4px 6px', textAlign: 'center' }}>Minimal</button>
              <button onClick={() => { setHudLevel('cinema'); setIsMenuOpen(false); }} className={hudLevel === 'cinema' ? 'active-opt' : ''} style={{ fontSize: '0.65rem', padding: '4px 6px', textAlign: 'center' }}>Cinema</button>
            </div>
          </div>

          <button onClick={() => { handleFullscreenToggle(); setIsMenuOpen(false); }} style={{ width: '100%', padding: '6px' }}>
            🖥️ Fullscreen
          </button>
        </div>
      </div>

      {/* TOOLS */}
      <div className="menu-group">
        <span className="menu-group-title">⚙️ TOOLS</span>
        <div className="menu-group-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => { setIsExplorerOpen(true); setIsMenuOpen(false); }} style={{ width: '100%' }}>
            📊 Planet Explorer
          </button>
          
          <button onClick={() => { setIsLeftPanelOpen(!isLeftPanelOpen); setIsMenuOpen(false); }} style={{ width: '100%' }}>
            ⚙️ Settings Panel: {isLeftPanelOpen ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* COMING SOON */}
      <div className="menu-group" style={{ marginTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px' }}>
        <span className="menu-group-title" style={{ color: 'var(--text-muted)' }}>🚀 Coming Soon</span>
        <div className="menu-group-options" style={{ opacity: 0.4, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button disabled style={{ cursor: 'not-allowed', color: 'rgba(255,255,255,0.5)' }}>🌌 Vedic Cosmos (v3.0)</button>
          <button disabled style={{ cursor: 'not-allowed', color: 'rgba(255,255,255,0.5)' }}>📅 Events</button>
          <button disabled style={{ cursor: 'not-allowed', color: 'rgba(255,255,255,0.5)' }}>🔬 Research</button>
          <button disabled style={{ cursor: 'not-allowed', color: 'rgba(255,255,255,0.5)' }}>🤖 AI Guide</button>
        </div>
      </div>
    </div>
  );
}
