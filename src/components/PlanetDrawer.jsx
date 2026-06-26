import React, { useState } from 'react';
import { PLANET_DATABASE } from '../data/planetDatabase.js';
import { getVedicDetails } from '../utils/vedicMath.js';
import { translations, planetDetails } from '../i18n.js';

export default function PlanetDrawer({ data, selectedPlanet, lang = 'en' }) {
  const [activeTab, setActiveTab] = useState('astronomy'); // 'astronomy', 'vedic', 'sinaank', 'research'

  const t = translations[lang];
  const pData = planetDetails[lang]; // For localized names only

  // Universal ID mapping (e.g. 'Sun' -> 'SUN')
  const uid = selectedPlanet ? selectedPlanet.toUpperCase() : 'SUN';
  const dbRecord = PLANET_DATABASE[uid] || PLANET_DATABASE['SUN'];
  
  // Localized Name mapping
  let localizedName = selectedPlanet;
  if (lang === 'hi' && pData[selectedPlanet]) {
    localizedName = pData[selectedPlanet].name.split(" ")[0]; // just the name part if there's a suffix
  }

  // Engine Data Mapping
  const isEarth = uid === 'EARTH';
  const engineData = isEarth ? data.earth : data.planets[selectedPlanet];
  
  // Format function for decimal degrees to deg° min'
  const formatDegMin = (decDeg) => {
    if (decDeg === undefined) return "--";
    const d = Math.floor(decDeg);
    const m = Math.floor((decDeg - d) * 60);
    return `${d}° ${m}'`;
  };

  // Vedic Math Integration
  let vedicInfo = null;
  if (!isEarth && engineData && engineData.longitude !== undefined) {
    vedicInfo = getVedicDetails(engineData.longitude, lang);
  }

  return (
    <div className="planet-details-drawer glass-panel">
      
      {/* Navigation Tabs (4 Permanent Tabs) */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'astronomy' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('astronomy')}
        >
          {t.tabAstronomy || "Astronomy"}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vedic' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('vedic')}
        >
          {t.tabVedic || "Vedic"}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sinaank' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('sinaank')}
        >
          {t.tabSinaank || "SINAANK"}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'research' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('research')}
        >
          {t.tabResearch || "Research"}
        </button>
      </div>

      <div className="tab-content-wrapper">
        <div className="drawer-header">
          <span className="drawer-emoji">
            {dbRecord.symbol}
          </span>
          <div>
            <h3 style={{ textTransform: 'none', margin: 0, padding: 0 }}>
              {localizedName}
            </h3>
            {/* Show Sign Badge only if not Earth and engineData has a sign */}
            {!isEarth && engineData && engineData.sign && (
              <span className="sign-badge" style={{ color: dbRecord.color }}>
                {engineData.sign}
              </span>
            )}
            {isEarth && (
              <span className="sign-badge" style={{ color: dbRecord.color }}>
                {lang === 'hi' ? "केंद्र (Geocenter)" : "Geocenter"}
              </span>
            )}
          </div>
        </div>

        {/* Tab 1: Astronomy */}
        {activeTab === 'astronomy' && (
          <div className="drawer-specs animate-fade-in">
            {isEarth && engineData ? (
              <>
                <div className="spec-row">
                  <span>{t.latitude || "Latitude"}</span>
                  <span className="font-mono">{engineData.latitude?.toFixed(4)}°</span>
                </div>
                <div className="spec-row">
                  <span>{t.longitude || "Longitude"}</span>
                  <span className="font-mono">{engineData.longitude?.toFixed(4)}°</span>
                </div>
                <div className="spec-row">
                  <span>{t.timeZone || "Time Zone"}</span>
                  <span className="font-mono">{engineData.timezoneOffset}</span>
                </div>
                <div className="spec-row section-divider">
                  <span>{t.lst || "LST"}</span>
                  <span className="font-mono">{engineData.lst}</span>
                </div>
                <div className="spec-row">
                  <span>{t.gst || "GST"}</span>
                  <span className="font-mono">{engineData.gst}</span>
                </div>
                <div className="spec-row">
                  <span>{t.julianDate || "Julian Date"}</span>
                  <span className="font-mono">{engineData.julianDate}</span>
                </div>
              </>
            ) : engineData ? (
              <>
                <div className="spec-row">
                  <span>{t.tableLongitude || "Longitude"}</span>
                  <span className="font-mono">{engineData.longitude?.toFixed(4)}°</span>
                </div>
                <div className="spec-row">
                  <span>{t.tableSign || "Sign"}</span>
                  <span className="font-mono">{engineData.sign}</span>
                </div>
                <div className="spec-row">
                  <span>{t.tableDegree || "Degree"}</span>
                  <span className="font-mono">{engineData.degree}° {engineData.minute}'</span>
                </div>
                <div className="spec-row">
                  <span>{t.tableSpeed || "Daily Speed"}</span>
                  <span className={`font-mono ${engineData.speed < 0 ? 'retro-color' : 'direct-color'}`}>
                    {engineData.speed?.toFixed(5)}°/day
                  </span>
                </div>
                <div className="spec-row">
                  <span>Retrograde / Direct</span>
                  <span className={engineData.retrograde ? 'retro-badge' : 'direct-badge'}>
                    {engineData.retrograde ? (t.yes || "Yes") : (t.no || "No")}
                  </span>
                </div>
                
                {/* Specifics from Data layer */}
                {uid === 'SUN' && data.sunStats && (
                  <div className="section-divider">
                    <div className="spec-row">
                      <span>{t.sunrise || "Sunrise"}</span>
                      <span className="font-mono">{data.sunStats.sunrise}</span>
                    </div>
                    <div className="spec-row">
                      <span>{t.sunset || "Sunset"}</span>
                      <span className="font-mono">{data.sunStats.sunset}</span>
                    </div>
                    <div className="spec-row">
                      <span>{t.declination || "Declination"}</span>
                      <span className="font-mono">{data.sunStats.declination}</span>
                    </div>
                  </div>
                )}
                
                {uid === 'MOON' && data.moonStats && (
                  <div className="section-divider">
                    <div className="spec-row">
                      <span>Distance</span>
                      <span className="font-mono">{data.moonStats.distance}</span>
                    </div>
                    <div className="spec-row">
                      <span>Phase</span>
                      <span className="font-mono">{data.moonStats.nextPhase}</span>
                    </div>
                    <div className="spec-row">
                      <span>Illumination</span>
                      <span className="font-mono">{data.moonStats.illumination}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="placeholder-text">Data unavailable</div>
            )}
          </div>
        )}

        {/* Tab 2: Vedic */}
        {activeTab === 'vedic' && (
          <div className="drawer-specs animate-fade-in">
            {isEarth ? (
              <div className="placeholder-text">Not applicable for Earth.</div>
            ) : vedicInfo && engineData ? (
              <>
                <div className="spec-row">
                  <span>Rashi (Sign)</span>
                  <span className="font-mono" style={{ color: dbRecord.color, fontWeight: 'bold' }}>{engineData.sign}</span>
                </div>
                <div className="spec-row">
                  <span>Nakshatra</span>
                  <span className="font-mono">{vedicInfo.nakshatra}</span>
                </div>
                <div className="spec-row">
                  <span>Pada (Quarter)</span>
                  <span className="font-mono">Pada {vedicInfo.pada}</span>
                </div>
                <div className="spec-row section-divider">
                  <span>House</span>
                  <span className="font-mono">House {engineData.house}</span>
                </div>
                <div className="spec-row" style={{ opacity: 0.5 }}>
                  <span>Dignity</span>
                  <span className="font-mono">Future Support</span>
                </div>
                <div className="spec-row" style={{ opacity: 0.5 }}>
                  <span>Exaltation/Debilitation</span>
                  <span className="font-mono">Future Support</span>
                </div>
              </>
            ) : (
              <div className="placeholder-text">Calculating...</div>
            )}
          </div>
        )}

        {/* Tab 3: SINAANK */}
        {activeTab === 'sinaank' && (
          <div className="placeholder-tab-view animate-fade-in">
            <h4>{t.futureFeature || "Coming Soon"}</h4>
            <p>Reserved for SINAANK dynamic models.</p>
            <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>No AI Output. No calculations yet.</p>
          </div>
        )}

        {/* Tab 4: Research */}
        {activeTab === 'research' && (
          <div className="drawer-specs animate-fade-in">
            {dbRecord.research ? (
              <>
                <div className="spec-row">
                  <span>Physical Diameter</span>
                  <span className="font-mono">{dbRecord.research.physicalDiameter}</span>
                </div>
                <div className="spec-row">
                  <span>Mean Distance</span>
                  <span className="font-mono">{dbRecord.research.meanDistance}</span>
                </div>
                <div className="spec-row section-divider">
                  <span>Orbital Period</span>
                  <span className="font-mono">{dbRecord.research.orbitalPeriod}</span>
                </div>
                <div className="spec-row">
                  <span>Rotation Period</span>
                  <span className="font-mono">{dbRecord.research.rotationPeriod}</span>
                </div>
                <div className="spec-row">
                  <span>Axial Tilt</span>
                  <span className="font-mono">{dbRecord.research.axialTilt}</span>
                </div>

                <div className="research-facts section-divider">
                  <h4 style={{ fontSize: '0.8rem', margin: '8px 0 4px 0', color: 'var(--text-secondary)' }}>Interesting Facts</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {dbRecord.research.interestingFacts.map((fact, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{fact}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="placeholder-text">Research data unavailable.</div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .planet-details-drawer {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
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
          transition: all 0.2s;
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
          gap: 12px;
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
        .drawer-specs {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
        .placeholder-tab-view {
          padding: 30px 10px;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
