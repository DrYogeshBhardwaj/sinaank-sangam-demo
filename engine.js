import SwissEph from 'swisseph-wasm';
import astronomy from 'astronomy-engine';
const { SearchRiseSet, Body: AstroBody, Observer: AstroObserver, MakeTime, Equator, Illumination, SearchLunarApsis, NextLunarApsis } = astronomy;

let swe = null;

export async function initEngine() {
  if (!swe) {
    swe = new SwissEph();
    await swe.initSwissEph();
  }
  return swe;
}

export function getEngineInstance() {
  return swe;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function getZodiacDetails(longitude) {
  const normalized = (longitude % 360 + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDegree = normalized % 30;
  
  const degree = Math.floor(signDegree);
  const totalMinutes = (signDegree - degree) * 60;
  const minute = Math.floor(totalMinutes);
  const second = Math.round((totalMinutes - minute) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex,
    degree,
    minute,
    second: second === 60 ? 59 : second
  };
}

export function getHouseNumber(longitude, cusps) {
  const lon = (longitude % 360 + 360) % 360;
  for (let i = 1; i <= 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[i === 12 ? 1 : i + 1];
    
    if (currentCusp < nextCusp) {
      if (lon >= currentCusp && lon < nextCusp) return i;
    } else {
      if (lon >= currentCusp || lon < nextCusp) return i;
    }
  }
  return 1;
}

function formatHours(decimalHours) {
  const h = Math.floor(decimalHours);
  const m = Math.floor((decimalHours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export async function getAstronomicalData({ dateStr, lat, lon, isSidereal = true, nodeOption = 'mean', timezone = 0, heliocentric = false }) {
  const instance = await initEngine();
  const date = new Date(dateStr);
  
  // Calculate UTC components
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Calculate Julian Day
  const jd = instance.julday(year, month, day, hours);

  // Ayanamsa
  let ayanamsa = 0;
  if (isSidereal) {
    instance.set_sid_mode(instance.SE_SIDM_LAHIRI, 0, 0);
    ayanamsa = instance.get_ayanamsa_ut(jd);
  }

  // Base Flags
  let flag = instance.SEFLG_SWIEPH | instance.SEFLG_SPEED;
  if (isSidereal) {
    flag |= instance.SEFLG_SIDEREAL;
  }
  if (heliocentric) {
    flag |= instance.SEFLG_HELCTR;
  }

  // House cusps (Geocentric only)
  let cusps = Array(13).fill(0);
  let ascendant = 0;
  let mc = 0;
  
  if (!heliocentric) {
    const houseFlag = isSidereal ? instance.SEFLG_SIDEREAL : 0;
    const housesData = instance.houses_ex(jd, houseFlag, lat, lon, 'P');
    cusps = Array.from(housesData.cusps);
    ascendant = housesData.ascmc[0];
    mc = housesData.ascmc[1];
  }

  // Define planets
  const planetConfig = [
    { name: 'Sun', id: instance.SE_SUN },
    { name: 'Moon', id: instance.SE_MOON },
    { name: 'Mercury', id: instance.SE_MERCURY },
    { name: 'Venus', id: instance.SE_VENUS },
    { name: 'Mars', id: instance.SE_MARS },
    { name: 'Jupiter', id: instance.SE_JUPITER },
    { name: 'Saturn', id: instance.SE_SATURN },
    { name: 'Uranus', id: instance.SE_URANUS },
    { name: 'Neptune', id: instance.SE_NEPTUNE },
    { name: 'Pluto', id: instance.SE_PLUTO }
  ];

  // In heliocentric view, Earth is a moving planet instead of the Sun
  if (heliocentric) {
    planetConfig.push({ name: 'Earth', id: instance.SE_EARTH });
  }

  const planets = {};

  for (const p of planetConfig) {
    // In heliocentric view, Sun is the center (0,0,0)
    if (heliocentric && p.name === 'Sun') {
      planets['Sun'] = {
        longitude: 0,
        latitude: 0,
        distance: 0,
        speed: 0,
        retrograde: false,
        house: 1,
        sign: "Aries",
        signIndex: 0,
        degree: 0,
        minute: 0,
        second: 0
      };
      continue;
    }

    const res = instance.calc_ut(jd, p.id, flag);
    const lonVal = res[0];
    const latVal = res[1];
    const distanceVal = res[2];
    const speedVal = res[3];
    
    const details = getZodiacDetails(lonVal);
    planets[p.name] = {
      longitude: lonVal,
      latitude: latVal,
      distance: distanceVal,
      speed: speedVal,
      retrograde: speedVal < 0,
      house: heliocentric ? 1 : getHouseNumber(lonVal, cusps),
      ...details
    };
  }

  // Rahu/Ketu (Geocentric only, omitted in heliocentric)
  if (!heliocentric) {
    const rahuId = nodeOption === 'true' ? instance.SE_TRUE_NODE : instance.SE_MEAN_NODE;
    const rahuRes = instance.calc_ut(jd, rahuId, flag);
    const rahuLon = rahuRes[0];
    const rahuSpeed = rahuRes[3];
    const rahuDetails = getZodiacDetails(rahuLon);

    planets['Rahu'] = {
      longitude: rahuLon,
      latitude: rahuRes[1],
      distance: rahuRes[2],
      speed: rahuSpeed,
      retrograde: rahuSpeed < 0,
      house: getHouseNumber(rahuLon, cusps),
      ...rahuDetails
    };

    const ketuLon = (rahuLon + 180) % 360;
    const ketuDetails = getZodiacDetails(ketuLon);
    planets['Ketu'] = {
      longitude: ketuLon,
      latitude: -rahuRes[1],
      distance: rahuRes[2],
      speed: rahuSpeed,
      retrograde: rahuSpeed < 0,
      house: getHouseNumber(ketuLon, cusps),
      ...ketuDetails
    };
  }

  const ascDetails = getZodiacDetails(ascendant);
  const mcDetails = getZodiacDetails(mc);

  // --- Dynamic Astronomical Calculations (Phase 4 & 5) ---
  
  // 1. Earth stats
  const gst = instance.sidtime(jd);
  const lst = (gst + lon / 15 + 24) % 24;

  const earth = {
    latitude: lat,
    longitude: lon,
    timezoneOffset: formatTimezoneOffset(timezone),
    lst: formatHours(lst),
    gst: formatHours(gst),
    julianDate: jd.toFixed(5),
    observerCity: "New Delhi",
    observerCountry: "India",
    altitude: "216m",
    gpsAccuracy: "±5m"
  };

  const obs = new AstroObserver(lat, lon, 0);
  const astroTime = MakeTime(date);

  // 2. Sun dynamic calculations
  const rise = SearchRiseSet(AstroBody.Sun, obs, 1, astroTime, 1);
  const set = SearchRiseSet(AstroBody.Sun, obs, -1, astroTime, 1);
  const sunEq = Equator(AstroBody.Sun, astroTime, obs, true, true);

  const formatTimeWithTimezone = (tTime) => {
    if (!tTime) return "--:--";
    const utcDate = tTime.date;
    const localDate = new Date(utcDate.getTime() + timezone * 60 * 60 * 1000);
    return localDate.toUTCString().replace("GMT", "").split(" ")[4].slice(0, 5);
  };

  const sunriseStr = formatTimeWithTimezone(rise);
  const sunsetStr = formatTimeWithTimezone(set);

  let solarNoonStr = "--:--";
  if (rise && set) {
    const transitMs = (rise.date.getTime() + set.date.getTime()) / 2;
    const transitDate = new Date(transitMs + timezone * 60 * 60 * 1000);
    solarNoonStr = transitDate.toUTCString().replace("GMT", "").split(" ")[4].slice(0, 5);
  }

  const sunStats = {
    sunrise: sunriseStr,
    sunset: sunsetStr,
    solarNoon: solarNoonStr,
    declination: sunEq ? `${sunEq.dec.toFixed(2)}°` : "--"
  };

  // 3. Moon dynamic calculations (with Perigee/Apogee for Moon Dashboard)
  const moonIllum = Illumination(AstroBody.Moon, astroTime);
  const moonLon = planets.Moon ? planets.Moon.longitude : 0;
  const moonSpeed = planets.Moon ? planets.Moon.speed : 13.0;

  const diffDeg = (30 - (moonLon % 30)) % 30;
  const daysToChange = diffDeg / moonSpeed;
  const hrsToChange = Math.floor(daysToChange * 24);
  const minsToChange = Math.floor((daysToChange * 24 - hrsToChange) * 60);

  const phaseAngle = moonIllum.phase_angle;
  let moonPhaseLabel = "New Moon";
  if (phaseAngle < 22.5 || phaseAngle >= 337.5) moonPhaseLabel = "New Moon";
  else if (phaseAngle >= 22.5 && phaseAngle < 67.5) moonPhaseLabel = "Waxing Crescent";
  else if (phaseAngle >= 67.5 && phaseAngle < 112.5) moonPhaseLabel = "First Quarter";
  else if (phaseAngle >= 112.5 && phaseAngle < 157.5) moonPhaseLabel = "Waxing Gibbous";
  else if (phaseAngle >= 157.5 && phaseAngle < 202.5) moonPhaseLabel = "Full Moon";
  else if (phaseAngle >= 202.5 && phaseAngle < 247.5) moonPhaseLabel = "Waning Gibbous";
  else if (phaseAngle >= 247.5 && phaseAngle < 292.5) moonPhaseLabel = "Last Quarter";
  else if (phaseAngle >= 292.5 && phaseAngle < 337.5) moonPhaseLabel = "Waning Crescent";

  // Lunar Node Apsis Calculations (Perigee/Apogee)
  const aps1 = SearchLunarApsis(astroTime);
  const aps2 = NextLunarApsis(aps1);
  const perigee = aps1.kind === 0 ? aps1 : aps2;
  const apogee = aps1.kind === 1 ? aps1 : aps2;

  // Format date helper
  const formatDateLabel = (d) => {
    return d.toISOString().slice(0, 16).replace("T", " ");
  };

  const moonStats = {
    nextSignChange: `${hrsToChange}h ${minsToChange}m`,
    nextPhase: moonPhaseLabel,
    illumination: `${Math.round(moonIllum.fraction * 100)}%`,
    distance: planets.Moon ? `${Math.round(planets.Moon.distance * 149597870.7).toLocaleString()} km` : "384,400 km",
    perigee: `${formatDateLabel(perigee.time.date)} (${Math.round(perigee.dist_km).toLocaleString()} km)`,
    apogee: `${formatDateLabel(apogee.time.date)} (${Math.round(apogee.dist_km).toLocaleString()} km)`
  };

  // 4. Moon History timeline data
  const yesterdayDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const tomorrowDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

  const yestJd = instance.julday(yesterdayDate.getUTCFullYear(), yesterdayDate.getUTCMonth() + 1, yesterdayDate.getUTCDate(), yesterdayDate.getUTCHours() + yesterdayDate.getUTCMinutes()/60);
  const tomJd = instance.julday(tomorrowDate.getUTCFullYear(), tomorrowDate.getUTCMonth() + 1, tomorrowDate.getUTCDate(), tomorrowDate.getUTCHours() + tomorrowDate.getUTCMinutes()/60);

  const yestRes = instance.calc_ut(yestJd, instance.SE_MOON, flag);
  const tomRes = instance.calc_ut(tomJd, instance.SE_MOON, flag);

  const moonHistory = {
    yesterday: getZodiacDetails(yestRes[0]),
    today: planets.Moon || {},
    tomorrow: getZodiacDetails(tomRes[0])
  };

  return {
    julianDay: jd,
    ayanamsa,
    ascendant: heliocentric ? null : {
      longitude: ascendant,
      house: 1,
      ...ascDetails
    },
    mc: heliocentric ? null : {
      longitude: mc,
      house: 10,
      ...mcDetails
    },
    cusps: heliocentric ? null : cusps.slice(1, 13),
    planets,
    earth,
    sunStats,
    moonStats,
    moonHistory,
    heliocentric
  };
}

function formatTimezoneOffset(offset) {
  const hrs = Math.floor(Math.abs(offset));
  const mins = Math.round((Math.abs(offset) - hrs) * 60);
  const sign = offset >= 0 ? '+' : '-';
  return `GMT${sign}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function closeEngine() {
  if (swe) {
    swe.close();
    swe = null;
  }
}
