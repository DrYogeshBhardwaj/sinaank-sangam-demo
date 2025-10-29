// ------- Robust fetch with fallback paths -------
async function fetchWithFallback(relPaths){
  const tries = Array.isArray(relPaths) ? relPaths : [relPaths];
  let lastErr;
  for(const p of tries){
    try{
      const res = await fetch(p, {cache:'no-cache'});
      if(res.ok) return res.json();
      lastErr = new Error(`${p} → ${res.status}`);
    }catch(e){ lastErr = e; }
  }
  throw lastErr || new Error('load failed');
}

// Build a list of safe alternatives for a given file under /public
function altPaths(file){
  // scripts/app.js is at /public/scripts/, so typical relative is ../<dir>/<file>
  return [
    `../${file}`,     // ../core/.. or ../content/..
    `./${file}`,      // ./core/.. (if script is moved later)
    `/${file}`,       // absolute from site root
    `${location.origin}/${file}` // fully absolute
  ];
}

const DATA = {};
async function loadAll(){
  const files = {
    rashiMap:  'core/rashi_sound_map.json',
    rashiProf: 'content/rashi_profiles.json',
    guidance:  'content/practical_guidance.json',
    advice:    'content/advice.json',
    remedies:  'content/remedies.json',
    defs:      'content/definitions.json',
    disc:      'content/disclaimer.json',
    relIntro:  'content/relation_intro_dynamic.json',
  };
  try{
    const [m,p,g,a,r,d,dc,ri] = await Promise.all([
      fetchWithFallback(altPaths(files.rashiMap)),
      fetchWithFallback(altPaths(files.rashiProf)),
      fetchWithFallback(altPaths(files.guidance)),
      fetchWithFallback(altPaths(files.advice)),
      fetchWithFallback(altPaths(files.remedies)),
      fetchWithFallback(altPaths(files.defs)),
      fetchWithFallback(altPaths(files.disc)),
      fetchWithFallback(altPaths(files.relIntro)),
    ]);
    DATA.rashiMap = m;
    DATA.rashiProfiles = Object.fromEntries(p.profiles.map(x=>[x.rashi,x]));
    DATA.guidance = Object.fromEntries(g.mobank.map(x=>[String(x.mobank),x.sections]));
    DATA.advice   = Object.fromEntries(a.mobank.map(x=>[String(x.mobank),x.advice]));
    DATA.remedies = r;
    DATA.defs = d.hi;
    DATA.disc = dc.hi;
    DATA.relIntro = ri;
  }catch(e){
    alert('Data load error: '+(e.message||e));
    throw e;
  }
}

// ------- Core calc helpers -------
function lastNonZero(msisdn){
  for(let i=msisdn.length-1;i>=0;i--){ const c=msisdn[i]; if(/\d/.test(c) && c!=='0') return Number(c); }
  return 0;
}
function digitSumToSingle(nstr){
  let s = [...nstr].filter(ch=>/\d/.test(ch)).reduce((t,c)=>t+Number(c),0);
  while(s>9) s = String(s).split('').reduce((t,c)=>t+Number(c),0);
  return s;
}
function nameToRashi(nameHi){
  const map = DATA.rashiMap.map; // [{rashi,prefixes}]
  let best = null, bestLen=0;
  for(const item of map){
    for(const pref of item.prefixes){
      if(nameHi.startsWith(pref) && pref.length>bestLen){ best=item.rashi; bestLen=pref.length; }
    }
  }
  if(best){ const lord = DATA.rashiMap.rules.lords[best]; return {rashi:best,lord}; }
  return {rashi:"मेष", lord:"मंगल"};
}
const MOBANK_TONE = {1:"आरंभ-शक्ति",2:"संतुलन",3:"अभिव्यक्ति",4:"स्थिरता",5:"उत्साह",6:"सहयोग",7:"दीर्घ-दृष्टि",8:"व्यावहारिक-शक्ति",9:"दृष्टि"};
function bucketKey(score){
  for(const b of DATA.relIntro.buckets){ if(score>=b.min && score<b.max) return b.key; }
  return DATA.relIntro.buckets.at(-1).key;
}
function relationIntro(relation_hi, score, rashiA, rashiB, mobankA, mobankB){
  const key = bucketKey(score);
  const hi = DATA.relIntro.hi;
  const rel = hi[relation_hi] || hi["डिफॉल्ट"];
  let text = rel[key] || Object.values(rel)[0] || "";
  const elemA = (DATA.rashiProfiles[rashiA]||{}).element || "तत्व";
  const elemB = (DATA.rashiProfiles[rashiB]||{}).element || "तत्व";
  text = text
    .replaceAll("{SCORE}", String(score))
    .replaceAll("{RASHI_ELEMENT}", `${elemA}–${elemB}`)
    .replaceAll("{MOBANK_TONE}", `${MOBANK_TONE[mobankA]||""} & ${MOBANK_TONE[mobankB]||""}`);
  text += ` इस संगम का संकेत ${score}/100 है; ${rashiA}–${rashiB} की संयुक्त तरंगें और Mobank ${mobankA}/${mobankB} की लय साथ मिलकर दिशा तय करती हैं।`;
  return text;
}

// ------- Render -------
function bul(list){ return list.map(x=>`– ${x}`).join('\n'); }
function calcBlock(name_en,name_hi,mobile,naamank){
  const mobank = lastNonZero(mobile);
  const yogank = digitSumToSingle(mobile);
  const sanyuktank = `${mobank}${yogank}`;
  const {rashi,lord} = nameToRashi(name_hi||name_en);
  // Yogank steps (pretty)
  const digits = [...mobile].filter(ch=>/\d/.test(ch)).join('+');
  const s = [...mobile].filter(ch=>/\d/.test(ch)).reduce((t,c)=>t+Number(c),0);
  const r1 = String(s).split('').join('+');
  const s1 = String(s).split('').reduce((t,c)=>t+Number(c),0);
  let yline = `${digits} = ${s} ⇒ ${r1} = ${s1}`;
  if(s1>9){ const r2 = String(s1).split('').join('+'); const s2 = String(s1).split('').reduce((t,c)=>t+Number(c),0); yline += ` ⇒ ${r2} = ${s2}`; }
  return { name_en,name_hi,mobile,naamank:naamank||'—', mobank,yogank,sanyuktank,rashi,lord, yline };
}

function render(){
  const A = calcBlock(
    document.getElementById('a_name_en').value.trim(),
    document.getElementById('a_name_hi').value.trim(),
    document.getElementById('a_mobile').value.trim(),
    document.getElementById('a_naamank').value.trim()
  );
  const B = calcBlock(
    document.getElementById('b_name_en').value.trim(),
    document.getElementById('b_name_hi').value.trim(),
    document.getElementById('b_mobile').value.trim(),
    document.getElementById('b_naamank').value.trim()
  );
  const relation_hi = document.getElementById('relation_hi').value;
  const harmony = Number(document.getElementById('harmony').value || 78);
  const intro = relationIntro(relation_hi, harmony, A.rashi, B.rashi, A.mobank, B.mobank);

  const GP = DATA.guidance, ADV = DATA.advice, RP = DATA.rashiProfiles;
  const workA = bul((GP[String(A.mobank)]?.Work?.hi)||[]);
  const relA  = bul((GP[String(A.mobank)]?.Relations?.hi)||[]);
  const finA  = bul((GP[String(A.mobank)]?.Finance?.hi)||[]);
  const wellA = bul((GP[String(A.mobank)]?.Wellbeing?.hi)||[]);
  const workB = bul((GP[String(B.mobank)]?.Work?.hi)||[]);
  const relB  = bul((GP[String(B.mobank)]?.Relations?.hi)||[]);
  const finB  = bul((GP[String(B.mobank)]?.Finance?.hi)||[]);
  const wellB = bul((GP[String(B.mobank)]?.Wellbeing?.hi)||[]);
  const smallA = (ADV[String(A.mobank)]?.small?.hi)||'';
  const bigA   = (ADV[String(A.mobank)]?.big?.hi)||'';
  const smallB = (ADV[String(B.mobank)]?.small?.hi)||'';
  const bigB   = (ADV[String(B.mobank)]?.big?.hi)||'';

  const defs = DATA.defs;
  const remedies = DATA.remedies;
  const disc = DATA.disc;

  const html = `
<h3>🪔 Mobile Sangam (Dual Report)</h3>
<div class="small">Relation: ${relation_hi} • Harmony: ${harmony}/100</div>

<div class="card"><b>0) परिभाषाएँ व गणना-विधि</b>
<pre>📐 ${defs.headline?.replace?.('📐 ','') || ''}

${defs.mobank}
${defs.yogank}
${defs.naamank}
${defs.sanyuktank}
</pre></div>

<div class="card"><b>1) आपकी वास्तविक गणनाएँ (दोनों)</b>
<div class="grid">
  <div><h4>व्यक्ति A: ${A.name_en} / ${A.name_hi} • ${A.mobile}</h4><pre>
• Mobank: अंतिम non-zero ⇒ <b>${A.mobank}</b>
• Yogank: ${A.yline} ⇒ <b>${A.yogank}</b>
• Naamank: <b>${A.naamank}</b>
• Sanyuktank: ${A.mobank}+${A.yogank} ⇒ <b>${A.sanyuktank}</b></pre></div>

  <div><h4>व्यक्ति B: ${B.name_en} / ${B.name_hi} • ${B.mobile}</h4><pre>
• Mobank: अंतिम non-zero ⇒ <b>${B.mobank}</b>
• Yogank: ${B.yline} ⇒ <b>${B.yogank}</b>
• Naamank: <b>${B.naamank}</b>
• Sanyuktank: ${B.mobank}+${B.yogank} ⇒ <b>${B.sanyuktank}</b></pre></div>
</div>
</div>

<div class="card"><b>2) गणना-सार (संगम)</b>
<pre>• A: Mobank ${A.mobank}, Yogank ${A.yogank}, Naamank ${A.naamank}, Sanyuktank ${A.sanyuktank} | Rashi ${A.rashi} (${A.lord})
• B: Mobank ${B.mobank}, Yogank ${B.yogank}, Naamank ${B.naamank}, Sanyuktank ${B.sanyuktank} | Rashi ${B.rashi} (${B.lord})
• Harmony: ${harmony}/100</pre></div>

<div class="card"><b>3) संबंध की ऊर्जा (डायनेमिक इंट्रो)</b><pre>${intro}</pre></div>

<div class="card"><b>4) राशि–स्वामी विवरण (A & B)</b>
<div class="grid">
  <div><h4>व्यक्ति A — ${A.rashi}</h4><pre>
स्वामी: ${A.lord} | तत्व: ${RP[A.rashi]?.element||''}
प्रमुख गुण: ${(RP[A.rashi]?.traits_hi||[]).join('、')}

${RP[A.rashi]?.profile_hi||''}</pre></div>
  <div><h4>व्यक्ति B — ${B.rashi}</h4><pre>
स्वामी: ${B.lord} | तत्व: ${RP[B.rashi]?.element||''}
प्रमुख गुण: ${(RP[B.rashi]?.traits_hi||[]).join('、')}

${RP[B.rashi]?.profile_hi||''}</pre></div>
</div>
</div>

<div class="card"><b>5) Practical Guidance</b>
<div class="grid">
  <div><h4>A — Mobank ${A.mobank}</h4><pre><b>Work</b>
${workA}

<b>Relations</b>
${relA}

<b>Finance</b>
${finA}

<b>Wellbeing</b>
${wellA}</pre></div>
  <div><h4>B — Mobank ${B.mobank}</h4><pre><b>Work</b>
${workB}

<b>Relations</b>
${relB}

<b>Finance</b>
${finB}

<b>Wellbeing</b>
${wellB}</pre></div>
</div>
</div>

<div class="card"><b>6) Sinaank Advice</b>
<div class="grid">
  <div><h4>A</h4><pre><b>Small (7 days)</b>
${smallA}

<b>Big (4–6 weeks)</b>
${bigA}</pre></div>
  <div><h4>B</h4><pre><b>Small (7 days)</b>
${smallB}

<b>Big (4–6 weeks)</b>
${bigB}</pre></div>
</div>
</div>

<div class="card"><b>7) उपाय — Simple (साझा)</b><pre>${(remedies.simple.hi||[]).map(x=>'– '+x).join('\n')}</pre></div>

<div class="card"><b>8) Sinaank Digital Remedies (साझा)</b><pre><b>${remedies.digital.hi.headline}</b>

${(remedies.digital.hi.bullets||[]).map(x=>'• '+x).join('\n')}

${remedies.digital.hi.cta}</pre></div>

<div class="card"><b>${disc.headline}</b><pre>${(disc.text||[]).map(x=>'• '+x).join('\n')}

➡ नोट: यह विश्लेषण ‘डिजिटल दिशा’ देने के लिए है; किसी प्रकार की भविष्यवाणी नहीं।</pre></div>
`;
  const box = document.getElementById('report');
  box.style.display='block';
  box.innerHTML = html;
}

function downloadHTML(){
  const src = document.getElementById('report').innerHTML;
  const html = `<!DOCTYPE html><meta charset="utf-8"><title>Sinaank Report</title><body style="font-family:Arial,'Noto Sans Devanagari',sans-serif;line-height:1.6;max-width:1000px;margin:auto;padding:16px">${src}</body>`;
  const blob = new Blob([html],{type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sinaank_sangam_report.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ------- Init -------
window.addEventListener('DOMContentLoaded', async ()=>{
  try{ await loadAll(); }catch(e){ /* alert already shown */ }
  document.getElementById('genBtn').addEventListener('click', render);
  document.getElementById('saveBtn').addEventListener('click', downloadHTML);
});
