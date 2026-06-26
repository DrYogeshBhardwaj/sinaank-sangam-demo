import { getAstronomicalData } from './engine.js';

async function test() {
  try {
    console.log("Testing getAstronomicalData calculation...");
    const data = await getAstronomicalData({
      dateStr: "2026-06-26T12:00:00Z",
      lat: 28.6139,
      lon: 77.2090,
      isSidereal: true,
      nodeOption: 'mean'
    });
    
    console.log("Calculation Successful!");
    console.log("Julian Day:", data.julianDay);
    console.log("Ayanamsa:", data.ayanamsa);
    console.log("Ascendant:", data.ascendant);
    console.log("MC:", data.mc);
    console.log("Sun Position:", data.planets.Sun);
    console.log("Moon Position:", data.planets.Moon);
    console.log("Rahu Position:", data.planets.Rahu);
    console.log("Ketu Position:", data.planets.Ketu);
    console.log("House Cusps:", data.cusps);
    process.exit(0);
  } catch (err) {
    console.error("Test Failed:", err);
    process.exit(1);
  }
}

test();
