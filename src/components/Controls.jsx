import React, { useState, useEffect } from 'react';
import { translations } from '../i18n.js';

const MULTIPLIERS = [1, 5, 10, 50, 100];
const INTERVAL_TYPES = ["minutes", "hours", "days", "weeks", "months", "years"];

export default function Controls({
  date,
  setDate,
  lat,
  setLat,
  lon,
  setLon,
  timezone,
  setTimezone,
  sidereal,
  setSidereal,
  nodeOption,
  setNodeOption,
  isAnimPlaying,
  setIsAnimPlaying,
  animSpeed,
  setAnimSpeed,
  animInterval,
  setAnimInterval,
  onStepTime,
  onReset,
  lang = 'en'
}) {
  const [cityQuery, setCityQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [timelineOffset, setTimelineOffset] = useState(0);
  const [baseTimelineDate, setBaseTimelineDate] = useState(null);

  const t = translations[lang];

  useEffect(() => {
    if (!isAnimPlaying && timelineOffset === 0) {
      setBaseTimelineDate(new Date(date.getTime()));
    }
  }, [date, isAnimPlaying]);

  const handleScrubChange = (e) => {
    const offsetVal = parseInt(e.target.value);
    setTimelineOffset(offsetVal);
    
    if (!baseTimelineDate) return;
    
    const targetDate = new Date(baseTimelineDate.getTime());
    switch (animInterval) {
      case 'minutes':
        targetDate.setUTCMinutes(targetDate.getUTCMinutes() + offsetVal);
        break;
      case 'hours':
        targetDate.setUTCHours(targetDate.getUTCHours() + offsetVal);
        break;
      case 'days':
        targetDate.setUTCDate(targetDate.getUTCDate() + offsetVal);
        break;
      case 'weeks':
        targetDate.setUTCDate(targetDate.getUTCDate() + offsetVal * 7);
        break;
      case 'months':
        targetDate.setUTCMonth(targetDate.getUTCMonth() + offsetVal);
        break;
      case 'years':
        targetDate.setUTCFullYear(targetDate.getUTCFullYear() + offsetVal);
        break;
      default:
        break;
    }
    setDate(targetDate);
  };

  const handleScrubRelease = () => {
    setTimelineOffset(0);
    setBaseTimelineDate(new Date(date.getTime()));
  };

  const formatOffset = (offset) => {
    const hrs = Math.floor(Math.abs(offset));
    const mins = Math.round((Math.abs(offset) - hrs) * 60);
    const sign = offset >= 0 ? '+' : '-';
    return `GMT${sign}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (cityQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetch(`/api/cities?query=${encodeURIComponent(cityQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data);
          setShowResults(true);
        })
        .catch(err => console.error("Error searching cities:", err));
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [cityQuery]);

  const selectCity = (city) => {
    setLat(city.lat);
    setLon(city.lon);
    setTimezone(city.offset);
    setCityQuery(`${city.name}, ${city.country}`);
    setShowResults(false);
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(parseFloat(position.coords.latitude.toFixed(4)));
        setLon(parseFloat(position.coords.longitude.toFixed(4)));
        const offsetHrs = -new Date().getTimezoneOffset() / 60;
        setTimezone(offsetHrs);
        setCityQuery(lang === 'hi' ? "वर्तमान स्थान (जीपीएस)" : "Current Location (GPS)");
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert(`Failed to retrieve coordinates: ${error.message}`);
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const getLocalDateTimeString = (d) => {
    const userTime = new Date(d.getTime() + timezone * 60 * 60 * 1000);
    const iso = userTime.toISOString();
    return iso.slice(0, 16);
  };

  const handleDateChange = (e) => {
    const localVal = e.target.value;
    if (!localVal) return;
    const localDate = new Date(localVal + ":00Z");
    const utcTime = new Date(localDate.getTime() - timezone * 60 * 60 * 1000);
    setDate(utcTime);
  };

  return (
    <div className="controls-panel glass-panel">
      
      {/* 1. Timeline Scrubber */}
      <div className="section-title">{t.timelineScrubber}</div>
      <div className="controls-group">
        <label>{t.timelineLabel} ({lang === 'hi' ? (animInterval === 'minutes' ? 'मिनट' : animInterval === 'hours' ? 'घंटे' : animInterval === 'days' ? 'दिन' : animInterval === 'weeks' ? 'सप्ताह' : animInterval === 'months' ? 'महीने' : 'वर्ष') : animInterval})</label>
        <div className="scrubber-wrapper">
          <span className="scrub-lbl">-30</span>
          <input
            type="range"
            min="-30"
            max="30"
            value={timelineOffset}
            onChange={handleScrubChange}
            onMouseUp={handleScrubRelease}
            onTouchEnd={handleScrubRelease}
            className="timeline-slider"
          />
          <span className="scrub-lbl">+30</span>
        </div>
        <div className="scrub-status-lbl font-mono">
          {t.timelineOffset}: {timelineOffset > 0 ? `+${timelineOffset}` : timelineOffset} {animInterval}
        </div>
      </div>

      {/* 2. Step Interval Drum Picker */}
      <div className="section-title">{t.stepIntervalUnit}</div>
      <div className="controls-group">
        <div className="drum-picker-container">
          {INTERVAL_TYPES.map(type => (
            <div
              key={type}
              className={`drum-picker-item ${animInterval === type ? 'active-unit' : ''}`}
              onClick={() => {
                setAnimInterval(type);
                setBaseTimelineDate(new Date(date.getTime()));
              }}
            >
              {lang === 'hi' ? (type === 'minutes' ? 'मिनट (Minutes)' : type === 'hours' ? 'घंटे (Hours)' : type === 'days' ? 'दिन (Days)' : type === 'weeks' ? 'सप्ताह (Weeks)' : type === 'months' ? 'महीने (Months)' : 'वर्ष (Years)') : type}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Location Settings Section */}
      <div className="section-title">{t.locationMachine}</div>
      <div className="controls-group">
        <div className="city-search-container">
          <label>{t.citySearch}</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={t.citySearchPlaceholder}
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              style={{ width: '100%' }}
            />
            {showResults && searchResults.length > 0 && (
              <ul className="search-dropdown">
                {searchResults.map(city => (
                  <li key={`${city.name}-${city.lat}`} onClick={() => selectCity(city)}>
                    {city.name}, {city.country} <span className="coords-lbl">({city.lat.toFixed(2)}, {city.lon.toFixed(2)})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="coords-inputs">
          <div>
            <label>{t.latitude}</label>
            <input
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>{t.longitude}</label>
            <input
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={lon}
              onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
            />
          </div>
          <button
            onClick={handleUseGPS}
            className="secondary gps-btn"
            disabled={gpsLoading}
          >
            {gpsLoading ? t.gpsLoading : t.gps}
          </button>
        </div>
      </div>

      {/* 4. Date/Time Configuration */}
      <div className="section-title">{t.dateTimeSettings}</div>
      <div className="controls-group">
        <div className="datetime-wrapper">
          <div>
            <label>{t.targetDateTime}</label>
            <input
              type="datetime-local"
              value={getLocalDateTimeString(date)}
              onChange={handleDateChange}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>{t.timeZone}</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            >
              {Array.from({ length: 27 }, (_, i) => i - 12).map(tz => (
                <option key={tz} value={tz}>
                  {formatOffset(tz)}
                </option>
              ))}
              <option value={5.5}>GMT+05:30 (India)</option>
              <option value={9.5}>GMT+09:30 (Adelaide)</option>
              <option value={12.75}>GMT+12:45 (Chatham)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Astronomical Preferences */}
      <div className="section-title">{t.calculations}</div>
      <div className="controls-group row-group">
        <div>
          <label>{t.zodiacSystem}</label>
          <div className="toggle-group">
            <button
              onClick={() => setSidereal(true)}
              className={sidereal ? '' : 'secondary'}
            >
              {t.sidereal}
            </button>
            <button
              onClick={() => setSidereal(false)}
              className={!sidereal ? '' : 'secondary'}
            >
              {t.tropical}
            </button>
          </div>
        </div>
        <div>
          <label>{t.lunarNode}</label>
          <select value={nodeOption} onChange={(e) => setNodeOption(e.target.value)}>
            <option value="mean">{t.meanNodes}</option>
            <option value="true">{t.trueNodes}</option>
          </select>
        </div>
      </div>

      {/* 6. Playback Animation Controls */}
      <div className="section-title">{t.playbackAnimation}</div>
      <div className="controls-group">
        <div className="anim-control-buttons">
          <button
            onClick={() => setIsAnimPlaying(!isAnimPlaying)}
            className={isAnimPlaying ? 'pause-btn' : 'play-btn'}
          >
            {isAnimPlaying ? t.pause : t.play}
          </button>
          <button onClick={onReset} className="secondary">
            {t.reset}
          </button>
        </div>

        <div className="speed-and-intervals">
          <div>
            <label>{t.animationSpeed}</label>
            <select
              value={animSpeed}
              onChange={(e) => setAnimSpeed(parseInt(e.target.value))}
            >
              {MULTIPLIERS.map(m => (
                <option key={m} value={m}>{m}x</option>
              ))}
            </select>
          </div>
          <div className="manual-steps">
            <label style={{ visibility: 'hidden' }}>Steps</label>
            <div className="step-btn-grid" style={{ marginTop: '4px' }}>
              <button onClick={() => onStepTime(-1)} className="secondary" style={{ padding: '8px' }}>{t.prevStep}</button>
              <button onClick={() => onStepTime(1)} className="secondary" style={{ padding: '8px' }}>{t.nextStep}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown on click outside */}
      {showResults && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }}
          onClick={() => setShowResults(false)}
        />
      )}

      <style>{`
        .section-title {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: bold;
        }
        .controls-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .controls-group.row-group {
          flex-direction: row;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .controls-group.row-group > div {
          flex: 1;
          min-width: 130px;
        }
        label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        
        .scrubber-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .scrub-lbl {
          font-family: var(--font-family-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
          width: 24px;
        }
        .timeline-slider {
          flex: 1;
          -webkit-appearance: none;
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        }
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent-color);
          box-shadow: 0 0 8px var(--accent-color);
          border: 2px solid #fff;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .timeline-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .scrub-status-lbl {
          font-size: 0.75rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .drum-picker-container {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
          max-height: 180px;
          overflow-y: auto;
        }
        .drum-picker-item {
          padding: 10px;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          text-transform: capitalize;
          border-bottom: 1px solid rgba(255,255,255,0.02);
        }
        .drum-picker-item:last-child {
          border-bottom: none;
        }
        .drum-picker-item:hover {
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }
        .drum-picker-item.active-unit {
          background: var(--accent-color);
          color: #fff;
          font-size: 0.95rem;
          text-shadow: 0 0 5px rgba(255,255,255,0.5);
          box-shadow: inset 0 0 8px rgba(0,0,0,0.3);
        }

        .coords-inputs {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .coords-inputs input {
          width: 80px;
        }
        .gps-btn {
          flex: 1;
          height: 38px;
        }
        .datetime-wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
        }
        .toggle-group {
          display: flex;
          gap: 4px;
        }
        .toggle-group button {
          flex: 1;
          padding: 8px 12px;
          font-size: 0.8rem;
        }
        .anim-control-buttons {
          display: flex;
          gap: 8px;
        }
        .anim-control-buttons button {
          flex: 1;
        }
        .play-btn {
          background: #10b981;
        }
        .play-btn:hover {
          background: #059669;
        }
        .pause-btn {
          background: #ef4444;
        }
        .pause-btn:hover {
          background: #dc2626;
        }
        .speed-and-intervals {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .step-btn-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        
        .city-search-container {
          position: relative;
        }
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #0e1124;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          z-index: 10;
          max-height: 200px;
          overflow-y: auto;
          list-style: none;
          margin-top: 4px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .search-dropdown li {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.15s ease;
        }
        .search-dropdown li:hover {
          background: rgba(255,255,255,0.05);
        }
        .coords-lbl {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
