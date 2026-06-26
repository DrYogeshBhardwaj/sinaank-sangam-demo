import { Body, MakeTime, GeoVector, Equator, Ecliptic, GeoMoon } from 'astronomy-engine';

const t = MakeTime(new Date('2000-01-01T12:00:00Z'));
const vec = GeoVector(Body.Sun, t, true);
console.log("Vector:", vec);

try {
  const eq = Equator(Body.Sun, t, {lat:0, lon:0, height:0}, true, true);
  console.log("Equator:", eq);
} catch (e) {
  console.log(e);
}

try {
  const ecl = Ecliptic(vec);
  console.log("Ecliptic from vec:", ecl);
} catch (e) {
  console.log("Ecliptic error:", e.message);
}
