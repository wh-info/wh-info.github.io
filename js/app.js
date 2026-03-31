// =============================================================================
// app.js — Core wormhole table engine
// =============================================================================

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  TIMING                                                                   ║
// ║  HOVER_COLOR_MS  — text color transition speed (ms)                       ║
// ║  LINE_DRAW_MS    — line draw animation duration (ms)                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
const HOVER_COLOR_MS      = 40;
const HOVER_LINE_DRAW_MS  = 0;    // line draw speed on hover  (0 = instant)
const CLICK_LINE_DRAW_MS  = 300;  // line draw speed on click
const COLOR_FADE_START    = 0.95; // 0 = highlight with line from start, 0.95 = highlight in last 5%

const FILTER_COLORS = {
  'spawn-c1':        '#42ffec', 'spawn-c2':        '#42b3ff',
  'spawn-c3':        '#4265ff', 'spawn-c4':        '#4230cf',
  'spawn-c5':        '#9c32ed', 'spawn-c6':        '#f230dc',
  'spawn-hs':        '#0dfa05', 'spawn-ls':        '#f0a800',
  'spawn-ns':        '#e81e1e', 'spawn-thera':     '#f6fc32',
  'spawn-shattered': '#ededed', 'spawn-pochven':   '#e81e1e',
  'spawn-drone':     '#e81e1e',
  'leads-c1':        '#42ffec', 'leads-c2':        '#42b3ff',
  'leads-c3':        '#4265ff', 'leads-c4':        '#4230cf',
  'leads-c5':        '#9c32ed', 'leads-c6':        '#f230dc',
  'leads-hs':        '#0dfa05', 'leads-ls':        '#f0a800',
  'leads-ns':        '#e81e1e', 'leads-thera':     '#f6fc32',
  'leads-c13':       '#ededed', 'leads-pochven':   '#e81e1e',
  'jump-destroyer':  '#1f5eeb', 'jump-bc':         '#36cccc',
  'jump-bs':         '#d6d9cc', 'jump-freighter':  '#f0a800',
  'jump-capital':    '#f0a800',
};
let WH_COLOR = '#e8d44d';
let monoMode = false;
let themeAccent = '#00c8c8';
let attrFallback = '#00c8c8';
const filterColor = fid => monoMode ? themeAccent : (FILTER_COLORS[fid] || attrFallback);

const SPAWN_MAP = {
  'Class 1':'spawn-c1','Class 2':'spawn-c2','Class 3':'spawn-c3',
  'Class 4':'spawn-c4','Class 5':'spawn-c5','Class 6':'spawn-c6',
  'HighSec':'spawn-hs','LowSec':'spawn-ls','NullSec':'spawn-ns',
  'Class 12 - Thera':'spawn-thera','Class 13 - Shattered':'spawn-shattered',
  'Pochven ▲ Trig space':'spawn-pochven','Drone Regions':'spawn-drone',
  'Drifter wormholes':'spawn-drifter','Jove Observatories':'spawn-jove',
  'never spawn':'spawn-never',
  'EXIT':'spawn-exit',
};
const LEADS_MAP = {
  'C1':'leads-c1','C2':'leads-c2','C3':'leads-c3','C4':'leads-c4',
  'C5':'leads-c5','C6':'leads-c6','HS':'leads-hs','LS':'leads-ls',
  'NS':'leads-ns','Thera':'leads-thera','C13':'leads-c13','Pochven':'leads-pochven',
  'Sentinel MZ':'leads-sentinel','Liberated Barbican':'leads-barbican',
  'Sanctified Vidette':'leads-vidette','Conflux Eyrie':'leads-eyrie',
  'Azdaja Redoubt':'leads-redoubt',
  'drifter blackhole':'leads-drifter','jump to identify':'leads-jump',
};
const JUMP_MAP = {
  'up to Destroyer':'jump-destroyer','up to Battlecruiser':'jump-bc',
  'up to Battleship':'jump-bs','up to Freighter':'jump-freighter','up to Capital':'jump-capital',
};
const MASS_MAP = {
  '100 000 000 kg':'mass-100m','500 000 000 kg':'mass-500m','750 000 000 kg':'mass-750m',
  '1 000 000 000 kg':'mass-1b','2 000 000 000 kg':'mass-2b','3 000 000 000 kg':'mass-3b',
  '3 300 000 000 kg':'mass-3b3','5 000 000 000 kg':'mass-5b',
};
const LIFE_MAP    = { '4.5h':'life-4h5','12h':'life-12h','16h':'life-16h','24h':'life-24h','48h':'life-48h' };
const SIG_MAP     = { 'I':'sig-I','II':'sig-II','III':'sig-III' };
const RESPAWN_MAP = { 'Static':'respawn-static','Wandering':'respawn-wandering','Reverse':'respawn-reverse' };

function entryToFilterIds(entry) {
  const ids = [];
  const add    = (map, v)   => { if (v && map[v]) ids.push(map[v]); };
  const addArr = (map, arr) => { if (arr) arr.forEach(v => { if (map[v]) ids.push(map[v]); }); };
  addArr(RESPAWN_MAP, entry.respawn);
  addArr(SPAWN_MAP, entry.spawn_in);
  addArr(LEADS_MAP, entry.leads_to);
  add(JUMP_MAP, entry.ship_size);
  add(MASS_MAP, entry.total_mass);
  add(LIFE_MAP, entry.life_time);
  addArr(SIG_MAP, entry.sig_level);
  return ids;
}

(function applyTransitionSpeed() {
  const s = document.createElement('style');
  s.textContent = `
    .content-row .wh-row a,
    .content-row .wh-row [data-wh],
    .content-row .filter-btn {
      transition: color ${HOVER_COLOR_MS}ms, opacity 200ms !important;
    }
    .col-header { transition: color ${HOVER_COLOR_MS}ms !important; }
    .wh-row [data-wh] { cursor: default; }
  `;
  document.head.appendChild(s);
})();

const canvas = document.getElementById('lineCanvas');
const ctx    = canvas.getContext('2d');
function resizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }
resizeCanvas();

const tableWrap = document.getElementById('tableWrap');
const filterMap = {};
document.querySelectorAll('[data-filter-id]').forEach(el => { filterMap[el.dataset.filterId] = el; });
const whMap = {};
document.querySelectorAll('[data-wh]').forEach(el => { whMap[el.dataset.wh] = el; });
const allContentEls = [
  ...document.querySelectorAll('.wh-row a'),
  ...document.querySelectorAll('.wh-row [data-wh]:not(a)'),
  ...document.querySelectorAll('.filter-btn:not(.invis)'),
];

const colHeaderMap = {
  'c-list':  document.querySelector('.header-row .c-list'),
  'c-respawn':  document.querySelector('.header-row .c-respawn'),
  'c-spawn': document.querySelector('.header-row .c-spawn'),
  'c-leads': document.querySelector('.header-row .c-leads'),
  'c-jump':  document.querySelector('.header-row .c-jump'),
  'c-mass':  document.querySelector('.header-row .c-mass'),
  'c-life':  document.querySelector('.header-row .c-life'),
  'c-sig':   document.querySelector('.header-row .c-sig'),
};
function getColClass(el) {
  for (const cls of Object.keys(colHeaderMap)) { if (el.closest('.'+cls)) return cls; }
  return null;
}
let litHeaderCell = null;
function lightHeader(el) {
  darkHeader();
  const cls = getColClass(el);
  if (cls && colHeaderMap[cls]) { colHeaderMap[cls].classList.add('col-lit'); litHeaderCell = colHeaderMap[cls]; }
}
function darkHeader() {
  if (litHeaderCell) { litHeaderCell.classList.remove('col-lit'); litHeaderCell = null; }
}

tableWrap.addEventListener('mouseenter', () => tableWrap.classList.add('table-hovered'));
tableWrap.addEventListener('mouseleave', () => {
  var si = document.getElementById('logo-search-input');
  if(!si || !si.value && !lockedStack.length) tableWrap.classList.remove('table-hovered');
  tableWrap.classList.remove('content-hovered', 'wh-hovered', 'attr-hovered');
  darkHeader();
});
const contentRow = document.querySelector('.content-row');
contentRow.addEventListener('mouseenter', () => tableWrap.classList.add('content-hovered'));
contentRow.addEventListener('mouseleave', () => {
  tableWrap.classList.remove('content-hovered', 'wh-hovered', 'attr-hovered');
  darkHeader();
});
const whListCell = document.querySelector('.wh-list');
whListCell.addEventListener('mouseenter', () => { tableWrap.classList.add('wh-hovered'); tableWrap.classList.remove('attr-hovered'); });
whListCell.addEventListener('mouseleave', () => tableWrap.classList.remove('wh-hovered'));
document.querySelectorAll('.content-row > .cell:not(.wh-list)').forEach(cell => {
  cell.addEventListener('mouseenter', () => { tableWrap.classList.add('attr-hovered'); tableWrap.classList.remove('wh-hovered'); });
  cell.addEventListener('mouseleave', () => tableWrap.classList.remove('attr-hovered'));
});

let WH_DATA       = {};
let REVERSE       = {};
let activeColored = [];
let lockedEl      = null;
let lockedStack   = [];   // array of locked filter elements (multi-lock)
let lockedWHKeys  = null; // current intersection of wormhole keys across all locked filters
let lineGeneration = 0;
let lockAnimating = false;
let glowAnimId = null;
let copyGlowAnimId = null;
let pulseGlowAnimId = null;
let pulseInterval = null;
let autofitReady = false;

const tooltip  = document.getElementById('wh-tooltip');
let tooltipKey = null;
let tooltipsEnabled = true;
let tooltipFadeTimer = null;
let pendingTooltip = null;
function positionTooltip(e) {
  const z=parseFloat(document.documentElement.style.zoom)||1;
  const pad=16, tw=tooltip.offsetWidth, th=tooltip.offsetHeight;
  const cx=e.clientX/z, cy=e.clientY/z;
  const vw=innerWidth/z, vh=innerHeight/z;
  let x=cx+pad, y=cy+4;
  if(x+tw>vw) x=cx-tw-pad;
  if(y<0) y=0;
  if(y+th>vh) y=vh-th;
  tooltip.style.left=x+'px'; tooltip.style.top=y+'px';
}
function revealTooltip(key,e,html) {
  tooltip.innerHTML=html;
  if(monoMode) tooltip.querySelectorAll('[style]').forEach(el=>{
    const hadColor = el.style.color;
    el.style.removeProperty('color');
    if(hadColor && document.documentElement.classList.contains('bw-light')){
      el.style.fontWeight = '700';
    }
  });
  tooltip.style.display='block';
  tooltip.style.opacity='0';
  tooltipKey=key;
  tooltip.offsetHeight;
  tooltip.style.opacity='1';
  positionTooltip(e);
}
function showTooltip(key,e,directHtml) {
  if(!tooltipsEnabled) return;
  const html=directHtml||(typeof TOOLTIP_CONTENT!=='undefined'?TOOLTIP_CONTENT[key]:null);
  if(!html) return;
  // If a tooltip is currently visible, fade it out first then show new one
  if(tooltipKey && tooltip.style.opacity!=='0') {
    tooltip.style.opacity='0';
    const vid=tooltip.querySelector('video'); if(vid) vid.pause();
    tooltipKey=null;
    pendingTooltip={key,e,html};
    if(tooltipFadeTimer) clearTimeout(tooltipFadeTimer);
    tooltipFadeTimer=setTimeout(()=>{ tooltipFadeTimer=null; if(pendingTooltip){ revealTooltip(pendingTooltip.key,pendingTooltip.e,pendingTooltip.html); pendingTooltip=null; } }, 80);
    return;
  }
  if(pendingTooltip) { pendingTooltip={key,e,html}; return; }
  revealTooltip(key,e,html);
}
function hideTooltip() {
  tooltip.style.opacity='0';
  const vid=tooltip.querySelector('video'); if(vid) vid.pause();
  tooltipKey=null;
  pendingTooltip=null;
  if(tooltipFadeTimer) clearTimeout(tooltipFadeTimer);
  tooltipFadeTimer=setTimeout(()=>{ tooltipFadeTimer=null; if(!tooltipKey) tooltip.style.display='none'; }, 80);
}
document.addEventListener('mousemove', e=>{ if(tooltipKey) positionTooltip(e); });

function getTextBounds(el) {
  const range=document.createRange();
  range.selectNodeContents(el);
  const rects=range.getClientRects();
  if(!rects.length) return el.getBoundingClientRect();
  let l=Infinity,r=-Infinity,t=Infinity,b=-Infinity;
  for(const rc of rects){
    if(rc.left<l)l=rc.left; if(rc.right>r)r=rc.right;
    if(rc.top<t)t=rc.top;   if(rc.bottom>b)b=rc.bottom;
  }
  return{left:l,right:r,top:t,bottom:b};
}
const midY = b => (b.top+b.bottom)/2;
function hexAlpha(hex,a){
  return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
}

function drawSegment(x0,y0,c0,x1,y1,c1,t) {
  const ex=x0+(x1-x0)*t, ey=y0+(y1-y0)*t;
  const g=ctx.createLinearGradient(x0,y0,x1,y1);
  g.addColorStop(0,hexAlpha(c0,0.75)); g.addColorStop(1,hexAlpha(c1,0.75));
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(ex,ey);
  ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
  ctx.restore();
}

function buildSegments(srcBounds, srcColor, targetPairs) {
  const x0=srcBounds.right, y0=midY(srcBounds);
  return targetPairs.map(({el,color})=>{
    const tb=getTextBounds(el);
    return{x0,y0,c0:srcColor,x1:tb.left,y1:midY(tb),c1:color};
  }).filter(s=>s.x1!==undefined);
}
function buildSegmentsReverse(srcBounds, srcColor, targetPairs) {
  const x0=srcBounds.left, y0=midY(srcBounds);
  return targetPairs.map(({el,color})=>{
    const wb=getTextBounds(el);
    return{x0,y0,c0:srcColor,x1:wb.right,y1:midY(wb),c1:color};
  }).filter(s=>s.x1!==undefined);
}

function lerpBase() {
  const v=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if(v&&v[0]==='#'&&v.length===7) return [parseInt(v.slice(1,3),16),parseInt(v.slice(3,5),16),parseInt(v.slice(5,7),16)];
  return [10,14,16];
}
function lerpColor(targetHex, t) {
  const r=parseInt(targetHex.slice(1,3),16), g=parseInt(targetHex.slice(3,5),16), b=parseInt(targetHex.slice(5,7),16);
  const [br,bg,bb]=lerpBase();
  const cr=Math.round(br+(r-br)*t), cg=Math.round(bg+(g-bg)*t), cb=Math.round(bb+(b-bb)*t);
  return `rgb(${cr},${cg},${cb})`;
}

function animateLines(segments, gen, durationMs, colorTargets, dimTargets, sourceEl, sourceColor, onDone) {
  if(!segments.length && !(colorTargets && colorTargets.length)) { if(onDone) onDone(); return; }
  // Immediately highlight the source element (the one clicked)
  if(sourceEl && sourceColor) applyColor(sourceEl, sourceColor);
  if(durationMs<=0) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    segments.forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
    if(colorTargets) colorTargets.forEach(({el,color})=>applyColor(el,color));
    if(dimTargets) dimTargets.forEach(el=>el.classList.add('dimmed'));
    if(onDone) onDone();
    return;
  }
  // Random speed per segment: 0.6× to 1.4× of base duration
  const segDurations=segments.map(()=>durationMs*(0.6+Math.random()*0.8));
  const maxDuration=Math.max(...segDurations);
  if(colorTargets) colorTargets.forEach(({el})=>{
    activeColored.push({el,origColor:el.style.color,origTextShadow:el.style.textShadow});
  });
  if(dimTargets) dimTargets.forEach(el=>el.classList.add('dimmed'));
  const startTime=performance.now();
  function frame(now) {
    if(lineGeneration!==gen) return;
    const elapsed=now-startTime;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const isLock=!!dimTargets;
    segments.forEach((s,i)=>{
      const t=Math.min(elapsed/segDurations[i],1);
      drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,t);
    });
    if(isLock){
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      segments.forEach((s,i)=>{
        const t=Math.min(elapsed/segDurations[i],1);
        if(t>=1) return;
        const px=s.x0+(s.x1-s.x0)*t, py=s.y0+(s.y1-s.y0)*t;
        const r0=parseInt(s.c0.slice(1,3),16),g0=parseInt(s.c0.slice(3,5),16),b0=parseInt(s.c0.slice(5,7),16);
        const r1=parseInt(s.c1.slice(1,3),16),g1=parseInt(s.c1.slice(3,5),16),b1=parseInt(s.c1.slice(5,7),16);
        const r=Math.round(r0+(r1-r0)*t),g=Math.round(g0+(g1-g0)*t),b=Math.round(b0+(b1-b0)*t);
        const gr=7;
        const grad=ctx.createRadialGradient(px,py,0,px,py,gr);
        grad.addColorStop(0,`rgba(${r},${g},${b},0.3)`);
        grad.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.fillStyle=grad;
        ctx.fillRect(px-gr,py-gr,gr*2,gr*2);
      });
      ctx.restore();
    }
    if(colorTargets) {
      colorTargets.forEach(({el,color},i)=>{
        const t=Math.min(elapsed/segDurations[i],1);
        const ct=COLOR_FADE_START>=1?1:Math.max(0,(t-COLOR_FADE_START)/(1-COLOR_FADE_START));
        const c=lerpColor(color,ct);
        el.style.setProperty('color',c,'important');
        if(el.hasAttribute('data-wh')) {
          const r=parseInt(color.slice(1,3),16),g=parseInt(color.slice(3,5),16),b=parseInt(color.slice(5,7),16);
          const bwl=isBwLight();
          const a1=bwl?(ct*0.2).toFixed(2):(ct*0.53).toFixed(2);
          const a2=bwl?(ct*0.08).toFixed(2):(ct*0.2).toFixed(2);
          const s1=bwl?3*ct:4*ct, s2=bwl?6*ct:8*ct;
          el.style.textShadow=`0 0 ${s1}px rgba(${r},${g},${b},${a1}), 0 0 ${s2}px rgba(${r},${g},${b},${a2})`;
        }
      });
    }
    if(elapsed<maxDuration) requestAnimationFrame(frame);
    else { if(onDone) onDone(); }
  }
  requestAnimationFrame(frame);
}

function isBwLight(){ return document.documentElement.classList.contains('bw-light'); }
function whGlow(color) {
  if(isBwLight()) return `0 0 3px ${color}33, 0 0 6px ${color}15`;
  return `0 0 5px ${color}aa, 0 0 10px ${color}55`;
}
function applyColor(el,color) {
  activeColored.push({el,origColor:el.style.color,origTextShadow:el.style.textShadow});
  el.style.setProperty('color',color,'important');
  if(el.hasAttribute('data-wh')) el.style.textShadow=whGlow(color);
}
function clearHoverColors() {
  activeColored.forEach(({el,origColor,origTextShadow})=>{
    el.style.removeProperty('color');
    if(origColor) el.style.color=origColor;
    el.style.textShadow=origTextShadow||'';
  });
  activeColored=[];
}
function applyDim(connectedEls) {
  allContentEls.forEach(el=>{ if(!connectedEls.has(el)) el.classList.add('dimmed'); });
}
function clearDim() { allContentEls.forEach(el=>{ el.classList.remove('dimmed'); el.style.opacity=''; }); }

function connectedSetForWH(whEl) {
  const s=new Set([whEl]);
  (WH_DATA[whEl.dataset.wh]||[]).forEach(fid=>{ const el=filterMap[fid]; if(el) s.add(el); });
  return s;
}
function connectedSetForFilter(filterEl) {
  const s=new Set([filterEl]);
  (REVERSE[filterEl.dataset.filterId]||[]).forEach(k=>{ const el=whMap[k]; if(el) s.add(el); });
  return s;
}

function startLinesFromWH(whEl, filterIds, durationMs, animateColors, dimTargets) {
  lineGeneration++;
  const gen=lineGeneration;
  const sb=getTextBounds(whEl);
  const pairs=filterIds.map(fid=>({el:filterMap[fid],color:filterColor(fid)})).filter(p=>p.el);
  const colorTargets=animateColors ? pairs : null;
  animateLines(buildSegments(sb,WH_COLOR,pairs), gen, durationMs, colorTargets, dimTargets, whEl, WH_COLOR);
}
function startLinesFromFilter(filterEl, whKeys, durationMs, animateColors, dimTargets, onDone) {
  lineGeneration++;
  const gen=lineGeneration;
  const fid=filterEl.dataset.filterId;
  const fb=getTextBounds(filterEl);
  const pairs=whKeys.map(k=>({el:whMap[k],color:WH_COLOR})).filter(p=>p.el);
  const colorTargets=animateColors ? pairs : null;
  animateLines(buildSegmentsReverse(fb,filterColor(fid),pairs), gen, durationMs, colorTargets, dimTargets, filterEl, filterColor(fid), onDone);
}
function stopLines() {
  lineGeneration++;
  if(glowAnimId){ cancelAnimationFrame(glowAnimId); glowAnimId=null; }
  if(copyGlowAnimId){ cancelAnimationFrame(copyGlowAnimId); copyGlowAnimId=null; }
  if(pulseGlowAnimId){ cancelAnimationFrame(pulseGlowAnimId); pulseGlowAnimId=null; }
  ctx.clearRect(0,0,canvas.width,canvas.height);
}
function buildGlowSegs(includeFilters) {
  const segs=[];
  lockedStack.forEach(el=>{
    if(el.hasAttribute('data-wh')){
      const sb=getTextBounds(el);
      (WH_DATA[el.dataset.wh]||[]).forEach(fid=>{
        const fe=filterMap[fid]; if(!fe) return;
        const tb=getTextBounds(fe);
        if(tb.left===undefined) return;
        segs.push({x0:sb.right,y0:midY(sb),x1:tb.left,y1:midY(tb),fid,rev:false});
      });
    } else if(includeFilters){
      const fb=getTextBounds(el);
      const fid=el.dataset.filterId;
      lockedWHKeys.forEach(k=>{
        const we=whMap[k]; if(!we) return;
        const wb=getTextBounds(we);
        if(wb.right===undefined) return;
        segs.push({x0:fb.left,y0:midY(fb),x1:wb.right,y1:midY(wb),fid,rev:true});
      });
    }
  });
  return segs;
}
function drawGlowDot(px,py,c0,c1,tLocal,boost,go,aO,gm,aM,gc2,aC) {
  const r0=parseInt(c0.slice(1,3),16),g0=parseInt(c0.slice(3,5),16),b0=parseInt(c0.slice(5,7),16);
  const r1=parseInt(c1.slice(1,3),16),g1=parseInt(c1.slice(3,5),16),b1=parseInt(c1.slice(5,7),16);
  const r=Math.round(r0+(r1-r0)*tLocal),g=Math.round(g0+(g1-g0)*tLocal),b=Math.round(b0+(b1-b0)*tLocal);
  const rc=Math.min(255,r+boost),gc_=Math.min(255,g+boost),bc=Math.min(255,b+boost);
  const gradO=ctx.createRadialGradient(px,py,0,px,py,go);
  gradO.addColorStop(0,`rgba(${r},${g},${b},${aO})`); gradO.addColorStop(1,`rgba(${r},${g},${b},0)`);
  ctx.fillStyle=gradO; ctx.fillRect(px-go,py-go,go*2,go*2);
  const gradM=ctx.createRadialGradient(px,py,0,px,py,gm);
  gradM.addColorStop(0,`rgba(${r},${g},${b},${aM})`); gradM.addColorStop(1,`rgba(${r},${g},${b},0)`);
  ctx.fillStyle=gradM; ctx.fillRect(px-gm,py-gm,gm*2,gm*2);
  const gradC=ctx.createRadialGradient(px,py,0,px,py,gc2);
  gradC.addColorStop(0,`rgba(${rc},${gc_},${bc},${aC})`); gradC.addColorStop(1,`rgba(${r},${g},${b},0)`);
  ctx.fillStyle=gradC; ctx.fillRect(px-gc2,py-gc2,gc2*2,gc2*2);
}
const GLOW_LINK={boost:100,go:20,aO:0.18,gm:8,aM:0.55,gc2:3,aC:0.95};
const GLOW_PULSE={boost:70,go:16,aO:0.12,gm:7,aM:0.4,gc2:3,aC:0.75};
const GLOW_LINK_LIGHT={boost:70,go:15,aO:0.12,gm:6,aM:0.40,gc2:2.5,aC:0.75};
const GLOW_PULSE_LIGHT={boost:50,go:12,aO:0.08,gm:5,aM:0.30,gc2:2,aC:0.60};
function glowParams(type) {
  const lt=isBwLight();
  if(type==='link') return lt?GLOW_LINK_LIGHT:GLOW_LINK;
  return lt?GLOW_PULSE_LIGHT:GLOW_PULSE;
}
function lerpGlow(a,b,sT) {
  return {boost:a.boost+(b.boost-a.boost)*sT,go:a.go+(b.go-a.go)*sT,aO:a.aO+(b.aO-a.aO)*sT,gm:a.gm+(b.gm-a.gm)*sT,aM:a.aM+(b.aM-a.aM)*sT,gc2:a.gc2+(b.gc2-a.gc2)*sT,aC:a.aC+(b.aC-a.aC)*sT};
}
function glowShrink(tLocal,returning) {
  const link=glowParams('link'), pulse=glowParams('pulse');
  if(!returning || tLocal>=0.3) return link;
  return lerpGlow(link,pulse,1-tLocal/0.3);
}
function fireCopyGlow(durationMs) {
  if(copyGlowAnimId){ cancelAnimationFrame(copyGlowAnimId); copyGlowAnimId=null; }
  const segs=buildGlowSegs(true);
  if(!segs.length) return;
  const startTime=performance.now();
  function frame(now) {
    const elapsed=Math.min((now-startTime)/durationMs,1);
    // Asymmetric round-trip: 300ms out, 700ms back
    const tLocal=elapsed<0.3 ? elapsed/0.3 : 1-(elapsed-0.3)/0.7;
    const returning=elapsed>=0.3;
    const g=glowShrink(tLocal,returning);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    segs.forEach(s=>{ const c0=s.rev?filterColor(s.fid):WH_COLOR,c1=s.rev?WH_COLOR:filterColor(s.fid); drawSegment(s.x0,s.y0,c0,s.x1,s.y1,c1,1); });
    ctx.save(); ctx.globalCompositeOperation='lighter';
    segs.forEach(s=>{
      const c0=s.rev?filterColor(s.fid):WH_COLOR, c1=s.rev?WH_COLOR:filterColor(s.fid);
      const px=s.x0+(s.x1-s.x0)*tLocal, py=s.y0+(s.y1-s.y0)*tLocal;
      drawGlowDot(px,py,c0,c1,tLocal,g.boost,g.go,g.aO,g.gm,g.aM,g.gc2,g.aC);
    });
    ctx.restore();
    if(elapsed<1) copyGlowAnimId=requestAnimationFrame(frame);
    else { copyGlowAnimId=null; restoreLockedState(); startPulse(); }
  }
  copyGlowAnimId=requestAnimationFrame(frame);
}
function fireReturnGlow(durationMs) {
  if(copyGlowAnimId){ cancelAnimationFrame(copyGlowAnimId); copyGlowAnimId=null; }
  const segs=buildGlowSegs(true);
  if(!segs.length) return;
  const startTime=performance.now();
  function frame(now) {
    const t=Math.min((now-startTime)/durationMs,1);
    const tLocal=1-t;
    const g=glowShrink(tLocal,true);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    segs.forEach(s=>{ const c0=s.rev?filterColor(s.fid):WH_COLOR,c1=s.rev?WH_COLOR:filterColor(s.fid); drawSegment(s.x0,s.y0,c0,s.x1,s.y1,c1,1); });
    ctx.save(); ctx.globalCompositeOperation='lighter';
    segs.forEach(s=>{
      const c0=s.rev?filterColor(s.fid):WH_COLOR, c1=s.rev?WH_COLOR:filterColor(s.fid);
      const px=s.x0+(s.x1-s.x0)*tLocal, py=s.y0+(s.y1-s.y0)*tLocal;
      drawGlowDot(px,py,c0,c1,tLocal,g.boost,g.go,g.aO,g.gm,g.aM,g.gc2,g.aC);
    });
    ctx.restore();
    if(t<1) copyGlowAnimId=requestAnimationFrame(frame);
    else { copyGlowAnimId=null; restoreLockedState(); startPulse(); }
  }
  copyGlowAnimId=requestAnimationFrame(frame);
}
function firePulseGlow(durationMs) {
  if(pulseGlowAnimId){ cancelAnimationFrame(pulseGlowAnimId); pulseGlowAnimId=null; }
  const segs=buildGlowSegs(false);
  if(!segs.length) return;
  const startTime=performance.now();
  function frame(now) {
    const t=Math.min((now-startTime)/durationMs,1);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    segs.forEach(s=>{ const c0=WH_COLOR,c1=filterColor(s.fid); drawSegment(s.x0,s.y0,c0,s.x1,s.y1,c1,1); });
    ctx.save(); ctx.globalCompositeOperation='lighter';
    segs.forEach(s=>{
      const c0=WH_COLOR, c1=filterColor(s.fid);
      const px=s.x0+(s.x1-s.x0)*t, py=s.y0+(s.y1-s.y0)*t;
      const gp=glowParams('pulse');
      drawGlowDot(px,py,c0,c1,t,gp.boost,gp.go,gp.aO,gp.gm,gp.aM,gp.gc2,gp.aC);
    });
    ctx.restore();
    if(t<1) pulseGlowAnimId=requestAnimationFrame(frame);
    else { pulseGlowAnimId=null; restoreLockedState(); }
  }
  pulseGlowAnimId=requestAnimationFrame(frame);
}
function startPulse() {
  stopPulse();
  pulseInterval=setInterval(()=>{
    if(lockedStack.length && !lockAnimating && !pulseGlowAnimId && !copyGlowAnimId){
      const hasWH=lockedStack.some(el=>el.hasAttribute('data-wh'));
      if(hasWH) firePulseGlow(500);
    }
  }, 5000);
}
function stopPulse() {
  if(pulseInterval){ clearInterval(pulseInterval); pulseInterval=null; }
  if(pulseGlowAnimId){ cancelAnimationFrame(pulseGlowAnimId); pulseGlowAnimId=null; }
}
function resetAll(keepTooltip) {
  stopLines(); stopPulse(); clearHoverColors(); clearDim();
  if(!keepTooltip) hideTooltip();
  // Force-clear any leftover inline styles from animations
  allContentEls.forEach(el=>{ el.style.removeProperty('color'); el.style.textShadow=''; });
  lockedEl=null; lockedStack=[]; lockedWHKeys=null; lockedSharedFilters=new Set();
  tableWrap.classList.remove('filter-locked');
  if(!tableWrap.matches(':hover')) tableWrap.classList.remove('table-hovered');
  lockAnimating=false;
  window.searchSingleMatch=false;
  setCopyMode(null);
  if(window.clearLockedWH) window.clearLockedWH();
  if(window.updateResetBtn) window.updateResetBtn();
}

let lockedSharedFilters = new Set();

// ── Copy-mode for logo-sub label ─────────────────────────────────────────────
const logoSub = document.querySelector('.logo-sub');
let copyModeWH = null;
let copiedTimer = null;
function setCopyMode(whKey) {
  if(!logoSub) return;
  if(copiedTimer){ clearTimeout(copiedTimer); copiedTimer=null; }
  if(whKey) {
    copyModeWH = whKey;
    logoSub.textContent = 'LINK';
    logoSub.classList.add('copy-mode');
  } else {
    copyModeWH = null;
    logoSub.textContent = 'WORMHOLES';
    logoSub.classList.remove('copy-mode');
  }
}
if(logoSub) logoSub.addEventListener('click', ()=>{
  if(!copyModeWH) return;
  if(logoSub.textContent === 'COPIED!') return;
  if(window.searchSingleMatch && whMap[copyModeWH] && !lockedStack.includes(whMap[copyModeWH])){
    const whKey = copyModeWH;
    const el = whMap[whKey];
    const url = 'https://whtype.info?type=' + whKey;
    navigator.clipboard.writeText(url).then(()=>{
      stopLines(); clearHoverColors(); clearDim();
      window.searchSingleMatch = false;
      if(window.deactivateSearch) window.deactivateSearch();
      activateLock(el);
      logoSub.textContent = 'COPIED!';
      copiedTimer = setTimeout(()=>{
        logoSub.textContent = copyModeWH ? 'LINK' : 'WORMHOLES';
      }, 1000);
      // Fire return glow (attrs→WH) after lock lines drawn, arrives as COPIED! fades
      setTimeout(()=>{ fireReturnGlow(700); }, CLICK_LINE_DRAW_MS);
    });
    return;
  }
  const url = 'https://whtype.info?type=' + copyModeWH;
  navigator.clipboard.writeText(url).then(()=>{
    fireCopyGlow(1000);
    logoSub.textContent = 'COPIED!';
    copiedTimer = setTimeout(()=>{
      if(copyModeWH) logoSub.textContent = 'LINK';
    }, 1000);
  });
});

// Get wormhole keys connected to an element (wh or filter)
function getConnectedWHKeys(el) {
  if(el.hasAttribute('data-wh')) {
    return WH_DATA[el.dataset.wh] ? [el.dataset.wh] : [];
  } else if(el.hasAttribute('data-filter-id')) {
    return REVERSE[el.dataset.filterId] || [];
  }
  return [];
}

// Compute the current wormhole key intersection across all locked stack elements
function computeStackWHKeys() {
  if(!lockedStack.length) return [];
  let keys=new Set(getConnectedWHKeys(lockedStack[0]));
  for(let i=1;i<lockedStack.length;i++){
    const elKeys=new Set(getConnectedWHKeys(lockedStack[i]));
    keys=new Set([...keys].filter(k=>elKeys.has(k)));
  }
  return [...keys];
}


// Find filters that share wormholes with the current locked WH keys (excluding already-locked ones)
function computeSharedFilters() {
  lockedSharedFilters=new Set();
  if(!lockedWHKeys||!lockedWHKeys.length) return;
  const lockedSet=new Set(lockedWHKeys);
  const stackSet=new Set(lockedStack);
  document.querySelectorAll('[data-filter-id]').forEach(fel=>{
    if(stackSet.has(fel)) return;
    const fkeys=REVERSE[fel.dataset.filterId]||[];
    if(fkeys.some(k=>lockedSet.has(k))) lockedSharedFilters.add(fel);
  });
}

// Restore the full locked state: DOM colors/dimming + redraw locked lines
function restoreLockedState() {
  if(!lockedStack.length) return;
  clearHoverColors(); clearDim();
  allContentEls.forEach(el=>{ el.style.removeProperty('color'); el.style.textShadow=''; });
  const visibleEls=new Set();
  lockedStack.forEach(el=>visibleEls.add(el));
  lockedStack.forEach(el=>{
    if(el.hasAttribute('data-wh')){
      const filterIds=WH_DATA[el.dataset.wh]||[];
      filterIds.forEach(fid=>{ if(filterMap[fid]) visibleEls.add(filterMap[fid]); });
    }
  });
  // Color locked elements
  lockedStack.forEach(el=>{
    if(el.hasAttribute('data-filter-id')) applyColor(el,filterColor(el.dataset.filterId));
    else applyColor(el,WH_COLOR);
  });
  // Color connected wormholes
  lockedWHKeys.forEach(k=>{ const el=whMap[k]; if(el){ applyColor(el,WH_COLOR); visibleEls.add(el); }});
  // Color connected filters when a WH is locked
  lockedStack.forEach(el=>{
    if(el.hasAttribute('data-wh')){
      const filterIds=WH_DATA[el.dataset.wh]||[];
      filterIds.forEach(fid=>{ const fel=filterMap[fid]; if(fel){ applyColor(fel,filterColor(fid)); visibleEls.add(fel); }});
    }
  });
  lockedSharedFilters.forEach(fel=>visibleEls.add(fel));
  // Dim everything not visible
  allContentEls.forEach(el=>{ if(!visibleEls.has(el)) el.classList.add('dimmed'); });
  // Soft-dim shared filters (only when a filter is locked, not a wormhole)
  const hasFilterLock=lockedStack.some(el=>el.hasAttribute('data-filter-id'));
  if(hasFilterLock) lockedSharedFilters.forEach(fel=>{ fel.style.opacity='0.5'; });
  // Redraw locked lines on canvas
  ctx.clearRect(0,0,canvas.width,canvas.height);
  lockedStack.forEach(el=>{
    if(el.hasAttribute('data-wh')){
      const sb=getTextBounds(el);
      const pairs=(WH_DATA[el.dataset.wh]||[]).map(fid=>({el:filterMap[fid],color:filterColor(fid)})).filter(p=>p.el);
      buildSegments(sb,WH_COLOR,pairs).forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
    } else {
      const fb=getTextBounds(el);
      const fid=el.dataset.filterId;
      const pairs=lockedWHKeys.map(k=>({el:whMap[k],color:WH_COLOR})).filter(p=>p.el);
      buildSegmentsReverse(fb,filterColor(fid),pairs).forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
    }
  });
}

// First lock (single element, animated)
function activateLock(el) {
  if(lockedStack.includes(el)){
    if(lockedStack.length===1){
      // Last element — full reset, keep tooltip
      resetAll(true);
      if(window.location.hash || window.location.search) history.pushState(null, '', window.location.pathname);
      return;
    }
    // Remove from stack, keep the rest
    lockedStack=lockedStack.filter(e=>e!==el);
    lockedWHKeys=computeStackWHKeys();
    computeSharedFilters();
    restoreLockedState();
    if(lockedStack.length===1 && lockedStack[0].hasAttribute('data-wh')){
      setCopyMode(lockedStack[0].dataset.wh);
    } else {
      setCopyMode(null);
    }
    return;
  }
  if(!lockedStack.length){
    // First lock — full reset, keep tooltip
    resetAll(true);
    tableWrap.classList.add('table-hovered');
    lockedEl=el;
    lockedStack=[el];
    lockedWHKeys=getConnectedWHKeys(el);
    computeSharedFilters();
    // Determine connected set for dimming
    const connected=new Set();
    connected.add(el);
    lockedWHKeys.forEach(k=>{ if(whMap[k]) connected.add(whMap[k]); });
    if(el.hasAttribute('data-wh')){
      (WH_DATA[el.dataset.wh]||[]).forEach(fid=>{ if(filterMap[fid]) connected.add(filterMap[fid]); });
    }
    const dimEls=allContentEls.filter(e=>!connected.has(e) && !lockedSharedFilters.has(e));
    if(el.hasAttribute('data-wh')){
      startLinesFromWH(el,WH_DATA[el.dataset.wh],CLICK_LINE_DRAW_MS,true,dimEls);
    } else {
      lockAnimating=true;
      startLinesFromFilter(el,REVERSE[el.dataset.filterId],CLICK_LINE_DRAW_MS,true,dimEls,()=>{ lockAnimating=false; });
    }
    // Soft-dim shared filters after animation starts (only for filter locks)
    if(el.hasAttribute('data-filter-id')){
      tableWrap.classList.add('filter-locked');
      setTimeout(()=>{ lockedSharedFilters.forEach(fel=>{ fel.style.opacity='0.5'; }); },0);
    }
  } else {
    // Additional lock — stack on top, narrow intersection
    lockedStack.push(el);
    lockedWHKeys=computeStackWHKeys();
    computeSharedFilters();
    // Instant redraw with new narrowed state
    restoreLockedState();
  }
  // Copy mode: only when exactly one WH is locked
  if(lockedStack.length===1 && lockedStack[0].hasAttribute('data-wh')){
    const whKey = lockedStack[0].dataset.wh;
    setCopyMode(whKey);
    if(window.showLockedWH) window.showLockedWH(whKey);
  } else {
    setCopyMode(null);
    if(window.clearLockedWH) window.clearLockedWH();
  }
  // Start pulse glow if a WH is locked
  const hasWH=lockedStack.some(e=>e.hasAttribute('data-wh'));
  if(hasWH) startPulse(); else stopPulse();
  if(window.updateResetBtn) window.updateResetBtn();
}

function wireInteractions() {
  document.querySelectorAll('[data-wh]').forEach(whEl => {
    const key=whEl.dataset.wh;
    whEl.addEventListener('mouseenter', e=>{
      if(!autofitReady) return;
      lightHeader(whEl);
      showTooltip(key,e);
      if(lockedStack.length) {
        const hasFilterLock=lockedStack.every(el=>el.hasAttribute('data-filter-id'));
        if(!hasFilterLock || !WH_DATA[key]) return;
        // Show hovered wormhole's connections ON TOP of locked state
        if(whListEl) whListEl.classList.remove('soft-reveal-active');
        clearHoverColors(); clearDim();
        // Rebuild visible set: locked elements + locked WHs + shared filters + hovered WH + hovered WH's filters
        const visibleEls=new Set();
        lockedStack.forEach(el=>visibleEls.add(el));
        lockedWHKeys.forEach(k=>{ if(whMap[k]) visibleEls.add(whMap[k]); });
        lockedSharedFilters.forEach(fel=>visibleEls.add(fel));
        visibleEls.add(whEl);
        const whFids=WH_DATA[key];
        whFids.forEach(fid=>{ if(filterMap[fid]) visibleEls.add(filterMap[fid]); });
        // Dim everything not visible
        allContentEls.forEach(el=>{ if(!visibleEls.has(el)) el.classList.add('dimmed'); });
        // Soft-dim shared filters (except those connected to hovered WH)
        const whFidSet=new Set(whFids);
        lockedSharedFilters.forEach(fel=>{
          if(!whFidSet.has(fel.dataset.filterId)) fel.style.opacity='0.5';
        });
        // Color locked elements
        lockedStack.forEach(el=>{
          if(el.hasAttribute('data-filter-id')) applyColor(el,filterColor(el.dataset.filterId));
        });
        lockedWHKeys.forEach(k=>{ const el=whMap[k]; if(el) applyColor(el,WH_COLOR); });
        // Color hovered wormhole + its filters
        applyColor(whEl,WH_COLOR);
        whFids.forEach(fid=>{ const el=filterMap[fid]; if(el) applyColor(el,filterColor(fid)); });
        // Draw locked lines + hovered WH lines on canvas
        lineGeneration++;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        lockedStack.forEach(el=>{
          if(el.hasAttribute('data-filter-id')){
            const fb=getTextBounds(el);
            const fid2=el.dataset.filterId;
            const p2=lockedWHKeys.map(k=>({el:whMap[k],color:WH_COLOR})).filter(p=>p.el);
            buildSegmentsReverse(fb,filterColor(fid2),p2).forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
          }
        });
        const sb=getTextBounds(whEl);
        const pairs=whFids.map(fid=>({el:filterMap[fid],color:filterColor(fid)})).filter(p=>p.el);
        buildSegments(sb,WH_COLOR,pairs).forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
        return;
      }
      if(window.searchSingleMatch) return;
      const logoCell = document.getElementById('logo-cell');
      const isSearch = logoCell && logoCell.classList.contains('search-mode') && !lockedStack.length;
      if(isSearch){
        clearHoverColors(); clearDim(); stopLines();
        // Rebuild: highlight hovered WH + its connected attributes, dim the rest
        const connected = connectedSetForWH(whEl);
        applyColor(whEl, WH_COLOR);
        (WH_DATA[key]||[]).forEach(fid=>{ const fe=filterMap[fid]; if(fe) applyColor(fe, filterColor(fid)); });
        applyDim(connected);
        startLinesFromWH(whEl, WH_DATA[key], HOVER_LINE_DRAW_MS, false);
      } else {
        clearHoverColors(); stopLines();
        if(WH_DATA[key]){
          startLinesFromWH(whEl,WH_DATA[key],HOVER_LINE_DRAW_MS,true);
        }
      }
    });
    whEl.addEventListener('mousemove', e=>{ if(tooltipKey===key) positionTooltip(e); });
    whEl.addEventListener('mouseleave', ()=>{
      darkHeader();
      if(window.searchSingleMatch){ hideTooltip(); return; }
      const logoCell = document.getElementById('logo-cell');
      const isSearch = logoCell && logoCell.classList.contains('search-mode') && !lockedStack.length;
      if(isSearch){
        // Restore search highlight state
        clearHoverColors(); clearDim(); stopLines();
        const val = document.getElementById('logo-search-input');
        if(val && val.value){
          const prefix = val.value.toUpperCase();
          const matchEls = [];
          Object.keys(whMap).forEach(k=>{
            if(k.toUpperCase() !== 'GEAR' && k.toUpperCase().startsWith(prefix)) matchEls.push(whMap[k]);
          });
          matchEls.forEach(el=> applyColor(el, WH_COLOR));
          const matchSet = new Set(matchEls);
          allContentEls.forEach(el=>{ if(!matchSet.has(el)) el.classList.add('dimmed'); });
        }
      } else if(lockedStack.length) {
        const hasFilterLock=lockedStack.every(el=>el.hasAttribute('data-filter-id'));
        if(hasFilterLock) {
          clearHoverColors(); clearDim(); stopLines();
          allContentEls.forEach(el=>{ el.style.removeProperty('color'); el.style.textShadow=''; });
          restoreLockedState();
          if(whListEl) whListEl.classList.add('soft-reveal-active');
        }
      } else {
        clearHoverColors(); stopLines();
      }
      hideTooltip();
    });
    whEl.addEventListener('click', e=>{
      e.preventDefault(); e.stopPropagation();
      var im = document.getElementById('info-menu'); if(im) im.classList.remove('open');
      var ib = document.getElementById('info-btn'); if(ib) ib.classList.remove('menu-open');
      if(!WH_DATA[key]) return;
      if(lockedStack.length && lockedStack.every(el=>el.hasAttribute('data-filter-id'))) {
        resetAll(true);
      }
      activateLock(whEl);
    });
  });

  document.querySelectorAll('[data-filter-id]').forEach(filterEl=>{
    const fid=filterEl.dataset.filterId;
    filterEl.addEventListener('mouseenter', e=>{
      if(!autofitReady) return;
      if(window.searchSingleMatch){ showTooltip(fid,e); return; }
      lightHeader(filterEl);
      showTooltip(fid,e);
      if(lockedStack.length) {
        // If a wormhole is locked, don't interact with attributes on hover
        const hasWHLock=lockedStack.some(el=>el.hasAttribute('data-wh'));
        if(hasWHLock) return;
        // Only allow hover on shared filters
        if(!lockedSharedFilters.has(filterEl)) return;
        // Compute intersection: current locked WHs ∩ hovered filter's WHs
        const lockedSet=new Set(lockedWHKeys);
        const hoveredKeys=REVERSE[fid]||[];
        const sharedKeys=hoveredKeys.filter(k=>lockedSet.has(k));
        if(!sharedKeys.length) return;
        clearHoverColors();
        clearDim();
        // Visible: shared wormholes + all locked stack elements + hovered filter
        const visibleEls=new Set(sharedKeys.map(k=>whMap[k]).filter(Boolean));
        lockedStack.forEach(el=>visibleEls.add(el));
        visibleEls.add(filterEl);
        allContentEls.forEach(el=>{ if(!visibleEls.has(el)) el.classList.add('dimmed'); });
        // Color everything visible
        sharedKeys.forEach(k=>{ const el=whMap[k]; if(el) applyColor(el,WH_COLOR); });
        applyColor(filterEl,filterColor(fid));
        lockedStack.forEach(el=>{
          if(el.hasAttribute('data-filter-id')) applyColor(el,filterColor(el.dataset.filterId));
          else applyColor(el,WH_COLOR);
        });
        // Draw locked lines (narrowed to shared WHs) + hovered filter lines on canvas
        lineGeneration++;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        lockedStack.forEach(el=>{
          if(el.hasAttribute('data-filter-id')){
            const fb=getTextBounds(el);
            const fid2=el.dataset.filterId;
            const p2=sharedKeys.map(k=>({el:whMap[k],color:WH_COLOR})).filter(p=>p.el);
            buildSegmentsReverse(fb,filterColor(fid2),p2).forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
          }
        });
        const fb=getTextBounds(filterEl);
        const fp=sharedKeys.map(k=>({el:whMap[k],color:WH_COLOR})).filter(p=>p.el);
        buildSegmentsReverse(fb,filterColor(fid),fp).forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
        return;
      }
      clearHoverColors(); stopLines();
      if(REVERSE[fid]){
        startLinesFromFilter(filterEl,REVERSE[fid],HOVER_LINE_DRAW_MS,true);
      }
    });
    filterEl.addEventListener('mousemove', e=>{ if(tooltipKey===fid) positionTooltip(e); });
    filterEl.addEventListener('mouseleave', ()=>{
      if(window.searchSingleMatch) return;
      darkHeader();
      if(lockedStack.length){
        const hasWHLock=lockedStack.some(el=>el.hasAttribute('data-wh'));
        if(!hasWHLock) restoreLockedState();
      } else {
        clearHoverColors(); stopLines();
      }
      hideTooltip();
    });
    filterEl.addEventListener('click', e=>{
      e.stopPropagation();
      var im = document.getElementById('info-menu'); if(im) im.classList.remove('open');
      var ib = document.getElementById('info-btn'); if(ib) ib.classList.remove('menu-open');
      if(!REVERSE[fid]) return;
      if(lockedStack.length && lockedStack.some(el=>el.hasAttribute('data-wh'))) {
        resetAll(true);
      }
      activateLock(filterEl);
    });
  });

  function clearHash(){
    if(window.location.hash || window.location.search) history.pushState(null, '', window.location.pathname);
  }
  document.addEventListener('click', e=>{
    if(e.target.closest('.content-row') || e.target.closest('.header-row')){
      if(window.refocusSearch) window.refocusSearch();
      return;
    }
    if(e.target.closest('#settings-panel') || e.target.closest('#settings-btn')) return;
    if(lockedStack.length){ resetAll(); clearHash(); }
    if(window.deactivateSearch) window.deactivateSearch();
  });
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape'){
      if(lockedStack.length){ resetAll(); clearHash(); }
      if(window.deactivateSearch) window.deactivateSearch();
      if(document.activeElement) document.activeElement.blur();
    }
  });

  // ── Reset button ────────────────────────────────────────────────────────
  const resetBtn = document.getElementById('reset-btn');
  function updateResetBtn(){
    if(!resetBtn) return;
    const logoCell = document.getElementById('logo-cell');
    const searchActive = logoCell && logoCell.classList.contains('search-mode');
    if(lockedStack.length || searchActive){
      resetBtn.classList.add('visible');
      var zoom = parseFloat(document.documentElement.style.zoom) || 1;
      var tableRect = tableWrap.getBoundingClientRect();
      var headerRow = tableWrap.querySelector('.header-row');
      var headerBottom = headerRow ? headerRow.getBoundingClientRect().bottom : tableRect.top;
      var contentMid = (headerBottom + tableRect.bottom) / 2;
      resetBtn.style.left = ((tableRect.right / zoom) - 14) + 'px';
      resetBtn.style.top = ((contentMid / zoom) - 14) + 'px';
    } else {
      resetBtn.classList.remove('visible');
    }
  }
  if(resetBtn){
    resetBtn.addEventListener('click', e=>{
      e.stopPropagation();
      if(lockedStack.length){ resetAll(); clearHash(); }
      if(window.deactivateSearch) window.deactivateSearch();
      updateResetBtn();
    });
  }
  window.updateResetBtn = updateResetBtn;

  const whListEl = document.querySelector('.wh-list');
  if(whListEl){
    whListEl.addEventListener('mouseenter', ()=>{
      if(!lockedStack.length || !lockedStack.every(el=>el.hasAttribute('data-filter-id'))) return;
      whListEl.classList.add('soft-reveal-active');
    });
    whListEl.addEventListener('mouseleave', ()=>{
      whListEl.classList.remove('soft-reveal-active');
    });
  }
}

function redrawIfActive() {
  if(lockedStack.length){ restoreLockedState(); }
}
window.addEventListener('scroll', redrawIfActive, {passive:true});
document.addEventListener('fullscreenchange', ()=>{ resetAll(); resizeCanvas(); });
window.addEventListener('autofit-done', ()=>{ autofitReady=true; resizeCanvas(); redrawIfActive(); if(window.updateResetBtn) window.updateResetBtn(); });

(function initClock(){
  const clockEl=document.getElementById('eve-clock');
  if(!clockEl) return;
  function tick(){
    const now=new Date();
    const h=String(now.getUTCHours()).padStart(2,'0');
    const m=String(now.getUTCMinutes()).padStart(2,'0');
    const s=String(now.getUTCSeconds()).padStart(2,'0');
    const mo=String(now.getUTCMonth()+1).padStart(2,'0');
    const d=String(now.getUTCDate()).padStart(2,'0');
    const yc=now.getUTCFullYear()-1898;
    clockEl.querySelector('.clock-time').textContent=`${h}:${m}:${s}`;
    clockEl.querySelector('.clock-date').textContent=`${mo}/${d}/${yc} YC`;
  }
  clockEl.innerHTML=`<span class="clock-time"></span><span class="clock-date"></span>`;
  tick(); setInterval(tick,1000);
  clockEl.addEventListener('mouseenter', e=>showTooltip('eve-clock',e));
  clockEl.addEventListener('mousemove',  e=>{ if(tooltipKey==='eve-clock') positionTooltip(e); });
  clockEl.addEventListener('mouseleave', ()=>hideTooltip());
})();

(function initHeaderTooltips(){
  const headerTips = {
    'c-list':    '&rarr; Just start typing!<br>&rarr; Input a wormhole type<br>&rarr; <em>Enter</em> to lock on it; <em>Esc</em> to reset the search',
    'c-respawn': 'Some wormholes are both static and wandering.',
    'c-spawn':   'Same wormhole type can appear in multiple classes.',
    'c-leads':   'Wormhole inner sphere reflects destination nebula/skybox.',
    'c-jump':    'Wormhole outer color shows jump size limit.',
    'c-mass':    'Total mass may vary &pm; 10%.',
    'c-life':    'Lifetime may increase for several hours relative to situational spawn mechanics.',
    'c-sig':     'Scanning difficulty level is revealed when your signal strength is &ge; 25%.',
  };
  document.querySelectorAll('.header-row .cell').forEach(cell=>{
    const cls=Object.keys(headerTips).find(c=>cell.classList.contains(c));
    if(!cls) return;
    const key='header-'+cls;
    const target=cell.querySelector('.col-header-text')||cell;
    target.addEventListener('mouseenter', e=>showTooltip(key,e,headerTips[cls]));
    target.addEventListener('mousemove',  e=>{ if(tooltipKey===key) positionTooltip(e); });
    target.addEventListener('mouseleave', ()=>hideTooltip());
  });
})();

(function boot(){
  if(typeof WH_ENTRIES==='undefined'){ console.warn('wormholes.js not loaded.'); wireInteractions(); return; }
  WH_ENTRIES.forEach(entry=>{ WH_DATA[entry.wormhole]=entryToFilterIds(entry); });
  REVERSE={};
  Object.entries(WH_DATA).forEach(([k,fids])=>{
    fids.forEach(fid=>{ (REVERSE[fid]=REVERSE[fid]||[]).push(k); });
  });
  wireInteractions();

  // ── Logo search bar ──────────────────────────────────────────────────────
  (function(){
    const logoCell = document.getElementById('logo-cell');
    const searchInput = document.getElementById('logo-search-input');
    const searchDisplay = document.getElementById('logo-search-display');
    if(!logoCell || !searchInput || !searchDisplay) return;
    let searchActive = false;
    window.searchSingleMatch = false;

    function updateDisplay(){
      const val = searchInput.value;
      searchDisplay.innerHTML = val + '<span class="search-cursor">_</span>';
    }

    function activateSearch(firstChar){
      if(lockedStack.length) resetAll();
      searchActive = true;
      logoCell.classList.add('search-mode');
      searchInput.value = firstChar || '';
      updateDisplay();
      if(window.updateResetBtn) window.updateResetBtn();
      searchInput.focus();
      if(firstChar){
        tableWrap.classList.add('table-hovered');
        highlightMatches(firstChar);
      }
    }

    function deactivateSearch(){
      if(!searchActive) return;
      searchActive = false;
      window.searchSingleMatch = false;
      logoCell.classList.remove('search-mode');
      searchInput.blur();
      searchInput.value = '';
      stopLines(); clearHoverColors(); clearDim();
      allContentEls.forEach(el=>{ el.style.removeProperty('color'); el.style.textShadow=''; });
      if(!tableWrap.matches(':hover')) tableWrap.classList.remove('table-hovered');
      if(window.updateResetBtn) window.updateResetBtn();
    }
    window.deactivateSearch = deactivateSearch;
    window.refocusSearch = function(){ if(searchActive) searchInput.focus(); };

    window.showLockedWH = function(whKey){
      if(!whKey){
        logoCell.classList.remove('search-mode');
        return;
      }
      searchActive = false;
      logoCell.classList.add('search-mode');
      searchDisplay.innerHTML = whKey + '<span class="search-cursor">_</span>';
    };
    window.clearLockedWH = function(){
      logoCell.classList.remove('search-mode');
    };

    function highlightMatches(val){
      stopLines(); clearHoverColors(); clearDim();
      allContentEls.forEach(el=>{ el.style.removeProperty('color'); el.style.textShadow=''; });
      if(!val){ window.searchSingleMatch = false; return; }
      const prefix = val.toUpperCase();
      const matchEls = [];
      Object.keys(whMap).forEach(k=>{
        if(k.toUpperCase() !== 'GEAR' && k.toUpperCase().startsWith(prefix)) matchEls.push(whMap[k]);
      });
      if(!matchEls.length){ window.searchSingleMatch = false; setCopyMode(null); return; }
      if(matchEls.length === 1){
        window.searchSingleMatch = true;
        const el = matchEls[0];
        const whKey = el.dataset.wh;
        setCopyMode(whKey);
        const filterIds = WH_DATA[whKey] || [];
        const connected = connectedSetForWH(el);
        applyColor(el, WH_COLOR);
        filterIds.forEach(fid=>{ const fe=filterMap[fid]; if(fe) applyColor(fe, filterColor(fid)); });
        applyDim(connected);
        startLinesFromWH(el, filterIds, HOVER_LINE_DRAW_MS, false);
      } else {
        window.searchSingleMatch = false;
        setCopyMode(null);
        matchEls.forEach(el=> applyColor(el, WH_COLOR));
        const matchSet = new Set(matchEls);
        allContentEls.forEach(el=>{
          if(!matchSet.has(el)) el.classList.add('dimmed');
        });
      }
    }

    const whKeys = Object.keys(whMap).filter(k => k.toUpperCase() !== 'GEAR').map(k => k.toUpperCase());

    searchInput.addEventListener('input', ()=>{
      let val = searchInput.value.toUpperCase();
      let filtered = '';
      for(let i = 0; i < val.length && filtered.length < 4; i++){
        const ch = val[i];
        if(filtered.length === 0 && /[A-Z]/.test(ch)){
          if(whKeys.some(k => k.startsWith(ch))) filtered += ch;
        } else if(filtered.length > 0 && filtered.length < 4 && /[0-9]/.test(ch)){
          const candidate = filtered + ch;
          if(whKeys.some(k => k.startsWith(candidate))) filtered += ch;
        }
      }
      searchInput.value = filtered;
      updateDisplay();
      if(!filtered && searchActive){
        deactivateSearch();
        return;
      }
      if(filtered && !searchActive){
        searchActive = true;
        hoverReveal = false;
        if(lockedStack.length) resetAll();
      }
      if(filtered) tableWrap.classList.add('table-hovered');
      highlightMatches(filtered);
    });

    searchInput.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        const val = searchInput.value.trim().toUpperCase();
        if(!val) return;
        const matches = Object.keys(whMap).filter(k => k.toUpperCase() !== 'GEAR' && k.toUpperCase().startsWith(val));
        if(matches.length === 1){
          const key = matches[0];
          stopLines(); clearHoverColors(); clearDim();
          resetAll();
          searchActive = false;
          activateLock(whMap[key]);
          searchInput.blur();
          searchInput.value = '';
        }
      }
      if(e.key === 'Escape'){
        deactivateSearch();
      }
    });

    // Global search — start typing anywhere
    document.addEventListener('keydown', (e)=>{
      if(searchActive) return;
      if(lockedStack.length && e.key === 'Backspace'){ return; }
      if(e.ctrlKey || e.altKey || e.metaKey) return;
      if(!/^[a-zA-Z]$/.test(e.key)) return;
      if(document.querySelector('.open')) return;
      const ch = e.key.toUpperCase();
      if(!whKeys.some(k => k.startsWith(ch))) return;
      e.preventDefault();
      activateSearch(ch);
    });

    let hoverReveal = false;

    logoCell.addEventListener('mouseenter', ()=>{
      const whLocked = lockedStack.length === 1 && lockedStack[0].hasAttribute('data-wh');
      if(!searchActive && !whLocked){
        hoverReveal = true;
        logoCell.classList.add('search-mode');
        searchInput.value = '';
        updateDisplay();
        searchInput.focus();
      }
    });

    logoCell.addEventListener('mouseleave', ()=>{
      if(hoverReveal && !searchActive){
        hoverReveal = false;
        logoCell.classList.remove('search-mode');
        searchInput.blur();
        searchInput.value = '';
      }
    });

  })();

  // ?type= or #type= deep link (case-insensitive, works locally and on server)
  function showWrongHole(invalidType){
    const overlay = document.getElementById('update-overlay');
    let panel = document.getElementById('wrong-hole');
    if(!panel){
      panel = document.createElement('div');
      panel.id = 'wrong-hole';
      document.body.appendChild(panel);
    }
    panel.classList.remove('open');
    panel.innerHTML = '';
    if(invalidType){
      const sub = document.createElement('div');
      sub.className = 'wrong-hole-type';
      const displayType = invalidType.charAt(0).toUpperCase() + invalidType.slice(1);
      sub.innerHTML = 'Invalid wormhole <span class="wrong-hole-value">?type=<s>' + displayType + '</s><span class="blink-cursor">_</span></span>';
      panel.appendChild(sub);
    }
    function closeWrongHole(){
      panel.classList.remove('open');
      if(overlay) overlay.classList.remove('open');
      // remove ?type= from URL
      var url = new URL(window.location);
      url.searchParams.delete('type');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    if(overlay){ overlay.classList.remove('open'); }
    requestAnimationFrame(()=>{
      if(overlay) overlay.classList.add('open');
      panel.classList.add('open');
    });
    if(overlay) overlay.addEventListener('click', closeWrongHole, {once:true});
    panel.addEventListener('click', closeWrongHole, {once:true});
    function escClose(e){
      if(e.key === 'Escape'){
        closeWrongHole();
        document.removeEventListener('keydown', escClose);
      }
    }
    document.addEventListener('keydown', escClose);
  }

  function tryDeepLink(){
    const s = window.location.search || '';
    const h = window.location.hash || '';
    const full = window.location.href || '';
    const match = s.match(/[?&]type=([^&#]+)/i)
              || h.match(/[#&]type=([^&#]+)/i)
              || full.match(/[?&#]type=([^&#]+)/i);
    if(!match) return;
    const typeParam = decodeURIComponent(match[1]).trim();
    if(typeParam.toUpperCase() === 'GEAR' || typeParam === '⚙') return;
    const key = Object.keys(whMap).find(k => k.toLowerCase() === typeParam.toLowerCase());
    if(!key || !whMap[key] || !WH_DATA[key] || !WH_DATA[key].length){
      showWrongHole(typeParam);
      return;
    }
    activateLock(whMap[key]);
  }
  // Wait for fonts + layout to settle before deep-linking
  window.addEventListener('load', ()=>{
    document.fonts.ready.then(()=>{
      resizeCanvas();
      tryDeepLink();
    });
  });
  // Re-trigger on hash change (pressing Enter on same hash URL doesn't reload)
  window.addEventListener('hashchange', ()=>{
    resetAll();
    tryDeepLink();
  });
  window.addEventListener('popstate', ()=>{
    resetAll();
    tryDeepLink();
  });
})();

// ── Preload tooltip videos ───────────────────────────────────────────────────
(function preloadVideos(){
  if(typeof TOOLTIP_CONTENT==='undefined') return;
  const srcs=new Set();
  Object.values(TOOLTIP_CONTENT).forEach(html=>{
    const matches=html.match(/src="([^"]+\.webm)"/g);
    if(matches) matches.forEach(m=>{ srcs.add(m.slice(5,-1)); });
  });
  srcs.forEach(src=>{
    const v=document.createElement('video');
    v.preload='auto'; v.muted=true; v.src=src;
  });
})();

// ── Viewport-fit scaling removed — table keeps full size, page scrolls ────────

