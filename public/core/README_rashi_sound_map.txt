Sinaank — Rashi Sound Map (v1.0.0)
====================================
Purpose
-------
Consistent, Vedic single-lord mapping from the **first Hindi sound** of a name
to **Rashi** and **Lord**, for Sinaank Sangam.

How to Use
----------
1) Transliterate the name to Hindi (Devanagari) by pronunciation (e.g., HEMANT → 'हेमंत').
2) Extract the starting sound and apply **longest-prefix** matching:
   - Try 2-character prefixes first (e.g., 'लो','हे','दी','ढा').
   - If none matches, fallback to 1-character (e.g., 'क','म','प','ह').
3) Use the 'map' below to pick exactly one Rashi. Then read its lord from 'lords'.

Special Cases (built-in)
------------------------
- 'हे' or 'हो' → कर्क (Cancer). Generic 'ह' → मिथुन (Gemini).
- 'लो' → मेष (Aries). Removed from वृश्चिक to avoid ambiguity.
- 'दी' → मीन (Pisces). Removed from वृषभ to avoid ambiguity.
- 'डा'/'डो' → कर्क (Cancer). Generic 'ड' → मिथुन (Gemini).
- 'द' → कुंभ (Aquarius).

Notes
-----
- This file encodes *Vedic single-lord* policy (no modern dual-lord usage).
- Keep RTL support separate for Urdu UI; this map is strictly Devanagari-based.
- If any regional exception arises, prefer the **longest-prefix** rule to maintain determinism.

File Layout
-----------
- `rashi_sound_map.json` → includes:
  * `rules`  : matching and special-case logic
  * `map`    : list of Rashis with prefixes and their single Vedic lord
