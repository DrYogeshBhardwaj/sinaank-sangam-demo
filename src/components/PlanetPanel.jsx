import React, { useState } from 'react';
import { translations, planetDetails } from '../i18n.js';
import { PLANET_DATABASE } from '../data/planetDatabase.js';

export default function PlanetPanel({ data, selectedPlanet, onSelectPlanet, lang = 'en' }) {
  const [isTableCollapsed, setIsTableCollapsed] = useState(true);

  if (!data) return null;

  const t = translations[lang];
  const pData = planetDetails[lang];

  return (
    <div className="panels-container">
      {/* Overview Planet Table */}
      <div className="planet-table-container glass-panel">
        <div className="table-header-row" onClick={() => setIsTableCollapsed(!isTableCollapsed)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem' }}>📋</span>
            <h4 style={{ fontSize: '0.95rem' }}>{t.tableTitle}</h4>
          </div>
          <button className="secondary toggle-collapse-btn">
            {isTableCollapsed ? t.showTable : t.collapseTable}
          </button>
        </div>

        {!isTableCollapsed && (
          <div className="table-wrapper animate-expand">
            <table className="planet-table">
              <thead>
                <tr>
                  <th>{t.tablePlanet}</th>
                  <th>{t.tableSign}</th>
                  <th>{t.tableDegree}</th>
                  <th>{t.tableLongitude}</th>
                  <th>{t.tableSpeed}</th>
                  <th>{t.tableRetro}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.planets).map(([name, planet]) => {
                  const uid = name.toUpperCase();
                  const dbRecord = PLANET_DATABASE[uid] || PLANET_DATABASE['SUN'];
                  const isSelected = selectedPlanet === name;
                  const displayName = pData[name] ? pData[name].name.split(" ")[0] : name;
                  
                  return (
                    <tr
                      key={name}
                      className={isSelected ? 'selected-row' : ''}
                      onClick={() => onSelectPlanet(name)}
                    >
                      <td className="planet-name-cell">
                        <span className="tbl-emoji">{dbRecord.symbol}</span>
                        {displayName}
                      </td>
                      <td>{planet.sign.slice(0, 3)}</td>
                      <td className="font-mono">{planet.degree}° {planet.minute}'</td>
                      <td className="font-mono text-dim">{planet.longitude.toFixed(3)}°</td>
                      <td className={`font-mono ${planet.speed < 0 ? 'retro-color' : 'direct-color'}`}>
                        {planet.speed.toFixed(3)}
                      </td>
                      <td>
                        <span className={planet.retrograde ? 'retro-dot' : 'direct-dot'}></span>
                        {planet.retrograde ? t.yes : t.no}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .panels-container {
          width: 100%;
        }
        .table-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }
        .toggle-collapse-btn {
          font-size: 0.75rem;
          padding: 4px 10px;
          height: fit-content;
        }
        
        /* Table Styles */
        .table-wrapper {
          overflow-x: auto;
          margin-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 12px;
        }
        .animate-expand {
          animation: slide-down-fade 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes slide-down-fade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .planet-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }
        .planet-table th, .planet-table td {
          padding: 10px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .planet-table th {
          color: var(--text-secondary);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .planet-table tbody tr {
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .planet-table tbody tr:hover {
          background: rgba(255,255,255,0.03);
        }
        .planet-table tbody tr.selected-row {
          background: rgba(99, 102, 241, 0.12);
          border-left: 2px solid var(--accent-color);
        }
        .planet-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        .tbl-emoji {
          font-size: 1rem;
        }
        .text-dim {
          color: var(--text-secondary);
        }
        .retro-dot, .direct-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .retro-dot { background: #ef4444; }
        .direct-dot { background: #10b981; }
      `}</style>
    </div>
  );
}
