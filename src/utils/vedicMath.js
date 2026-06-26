const NAKSHATRAS_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRAS_HI = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा",
  "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी",
  "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा",
  "पूर्व भाद्रपद", "उत्तर भाद्रपद", "रेवती"
];

export function getVedicDetails(longitude, lang = 'en') {
  // Normalize longitude to 0-360
  const normalized = (longitude % 360 + 360) % 360;
  
  // 1 Nakshatra = 13°20' = 13.333333°
  // 1 Pada = 3°20' = 3.333333°
  
  const nakshatraIndex = Math.floor(normalized / (13 + 1/3));
  const remainder = normalized % (13 + 1/3);
  
  const pada = Math.floor(remainder / (3 + 1/3)) + 1;
  
  const nakshatras = lang === 'hi' ? NAKSHATRAS_HI : NAKSHATRAS_EN;
  
  return {
    nakshatra: nakshatras[nakshatraIndex],
    pada: pada,
    nakshatraIndex: nakshatraIndex + 1 // 1-indexed
  };
}
