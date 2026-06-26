import express from 'express';
import cors from 'cors';
import { getAstronomicalData, initEngine } from './engine.js';
import { searchCities, defaultCities } from './cities.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Swiss Ephemeris on server start
console.log("Initializing Swiss Ephemeris Engine...");
initEngine()
  .then(() => console.log("Swiss Ephemeris Engine ready."))
  .catch(err => {
    console.error("Failed to initialize Swiss Ephemeris:", err);
    process.exit(1);
  });

// --- Standard Unified API (Phase 1-4) ---
app.get('/api/planets', async (req, res) => {
  try {
    const { date, lat, lon, sidereal, node, heliocentric } = req.query;
    
    if (!date || !lat || !lon) {
      return res.status(400).json({
        error: "Missing required query parameters: date, lat, lon"
      });
    }

    const data = await getAstronomicalData({
      dateStr: date,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      isSidereal: sidereal !== 'false',
      nodeOption: node || 'mean',
      timezone: parseFloat(req.query.timezone) || 0,
      heliocentric: heliocentric === 'true'
    });

    res.json(data);
  } catch (error) {
    console.error("Error calculating planetary positions:", error);
    res.status(500).json({ error: error.message || "Calculation failed" });
  }
});

// --- SINAANK Planet API (Phase 5 Modular Endpoints) ---

// 1. GET /api/live-planets
app.get('/api/live-planets', async (req, res) => {
  try {
    const { date, lat, lon, sidereal, node, heliocentric } = req.query;
    if (!date || !lat || !lon) return res.status(400).json({ error: "Missing date, lat, or lon" });

    const data = await getAstronomicalData({
      dateStr: date,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      isSidereal: sidereal !== 'false',
      nodeOption: node || 'mean',
      timezone: parseFloat(req.query.timezone) || 0,
      heliocentric: heliocentric === 'true'
    });

    res.json({
      julianDay: data.julianDay,
      ayanamsa: data.ayanamsa,
      planets: data.planets,
      heliocentric: data.heliocentric
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/moon
app.get('/api/moon', async (req, res) => {
  try {
    const { date, lat, lon, timezone } = req.query;
    if (!date || !lat || !lon) return res.status(400).json({ error: "Missing date, lat, or lon" });

    const data = await getAstronomicalData({
      dateStr: date,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      isSidereal: true,
      timezone: parseFloat(timezone) || 0
    });

    res.json({
      moon: data.planets.Moon,
      stats: data.moonStats,
      history: data.moonHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/sun
app.get('/api/sun', async (req, res) => {
  try {
    const { date, lat, lon, timezone } = req.query;
    if (!date || !lat || !lon) return res.status(400).json({ error: "Missing date, lat, or lon" });

    const data = await getAstronomicalData({
      dateStr: date,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      isSidereal: true,
      timezone: parseFloat(timezone) || 0
    });

    res.json({
      sun: data.planets.Sun,
      stats: data.sunStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/lagna
app.get('/api/lagna', async (req, res) => {
  try {
    const { date, lat, lon, sidereal } = req.query;
    if (!date || !lat || !lon) return res.status(400).json({ error: "Missing date, lat, or lon" });

    const data = await getAstronomicalData({
      dateStr: date,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      isSidereal: sidereal !== 'false'
    });

    res.json({
      ascendant: data.ascendant,
      mc: data.mc,
      cusps: data.cusps,
      ayanamsa: data.ayanamsa
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /api/chart
app.get('/api/chart', async (req, res) => {
  try {
    const { date, lat, lon, sidereal, node, timezone, heliocentric } = req.query;
    if (!date || !lat || !lon) return res.status(400).json({ error: "Missing date, lat, or lon" });

    const data = await getAstronomicalData({
      dateStr: date,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      isSidereal: sidereal !== 'false',
      nodeOption: node || 'mean',
      timezone: parseFloat(timezone) || 0,
      heliocentric: heliocentric === 'true'
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to search cities
app.get('/api/cities', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json(defaultCities);
  }
  const results = searchCities(query);
  res.json(results);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from the React dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Live Planet Engine API and UI running on http://localhost:${PORT}`);
});
