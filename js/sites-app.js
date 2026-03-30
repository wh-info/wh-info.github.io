// =============================================================================
// sites-app.js — Core table engine for safe-explo page
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
  'safe-yes':       '#0dfa05',
  'safe-no':        '#e81e1e',
  'mod-relic':      '#1f5eeb',
  'mod-data':       '#36cccc',
  'mod-gas':        '#f0a800',
  'appear-c1':      '#42ffec',
  'appear-c2':      '#42b3ff',
  'appear-c3':      '#4265ff',
  'appear-c4':      '#4230cf',
  'appear-c5':      '#9c32ed',
  'appear-c6':      '#f230dc',
  'appear-c13':     '#ededed',
  'appear-shattered':'#ededed',
  'appear-hs':      '#0dfa05',
  'appear-ls':      '#f0a800',
  'appear-ns':      '#e81e1e',
  'appear-drone':   '#e81e1e',
};
let WH_COLOR = '#e8d44d';
let monoMode = false;
let themeAccent = '#00c8c8';
let attrFallback = '#00c8c8';
const filterColor = fid => monoMode ? themeAccent : (FILTER_COLORS[fid] || attrFallback);

const SAFE_MAP    = { 'SAFE':'safe-yes', 'NOT SAFE':'safe-no' };
const MODULE_MAP  = { 'Relic Analyser':'mod-relic', 'Data Analyser':'mod-data', 'Gas Scoop / Harvester':'mod-gas' };
const TYPE_MAP    = { 'Relic':'type-relic', 'Data':'type-data', 'Drone':'type-drone', 'Ghost':'type-ghost', 'Gas':'type-gas' };
const APPEAR_MAP  = {
  'C1':'appear-c1','C2':'appear-c2','C3':'appear-c3','C4':'appear-c4',
  'C5':'appear-c5','C6':'appear-c6','C13':'appear-c13','Shattered':'appear-shattered',
  'HS':'appear-hs','LS':'appear-ls','NS':'appear-ns','Drone Regions':'appear-drone',
};
const GAS_MAP     = {
  'C50':'gas-c50','C60':'gas-c60','C70':'gas-c70','C72':'gas-c72',
  'C84':'gas-c84','C28':'gas-c28','C32':'gas-c32','C320':'gas-c320','C540':'gas-c540',
};

function entryToFilterIds(entry) {
  const ids = [];
  const add    = (map, v)   => { if (v && map[v]) ids.push(map[v]); };
  const addArr = (map, arr) => { if (arr) arr.forEach(v => { if (map[v]) ids.push(map[v]); }); };
  addArr(SAFE_MAP, entry.safe);
  addArr(MODULE_MAP, entry.module);
  addArr(TYPE_MAP, entry.type);
  addArr(APPEAR_MAP, entry.appear_in);
  addArr(GAS_MAP, entry.gas);
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

const colHeaderMap = {};
document.querySelectorAll('.header-row .cell').forEach(cell => {
  cell.classList.forEach(cls => {
    if(cls.startsWith('c-')) colHeaderMap[cls] = cell;
  });
});
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
  if(!lockedStack.length) tableWrap.classList.remove('table-hovered');
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
let lockedStack   = [];
let lockedWHKeys  = null;
let lineGeneration = 0;
let lockAnimating = false;

const tooltip  = document.getElementById('wh-tooltip');
let tooltipKey = null;
let tooltipsEnabled = true;
let tooltipFadeTimer = null;
let pendingTooltip = null;
function positionTooltip(e) {
  const pad=16, tw=tooltip.offsetWidth, th=tooltip.offsetHeight;
  let x=e.clientX+pad, y=e.clientY+4;
  if(x+tw>innerWidth)  x=e.clientX-tw-pad;
  if(y+th>innerHeight) y=e.clientY-th-pad;
  tooltip.style.left=x+'px'; tooltip.style.top=y+'px';
}
function revealTooltip(key,e,html) {
  tooltip.innerHTML=html;
  if(monoMode) tooltip.querySelectorAll('[style]').forEach(el=>{
    el.style.removeProperty('color');
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
  if(sourceEl && sourceColor) applyColor(sourceEl, sourceColor);
  if(durationMs<=0) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    segments.forEach(s=>drawSegment(s.x0,s.y0,s.c0,s.x1,s.y1,s.c1,1));
    if(colorTargets) colorTargets.forEach(({el,color})=>applyColor(el,color));
    if(dimTargets) dimTargets.forEach(el=>el.classList.add('dimmed'));
    if(onDone) onDone();
    return;
  }
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
let pulseGlowAnimId = null;
let pulseInterval = null;
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
function firePulseGlow(durationMs) {
  if(pulseGlowAnimId){ cancelAnimationFrame(pulseGlowAnimId); pulseGlowAnimId=null; }
  const segs=[];
  lockedStack.forEach(el=>{
    if(el.hasAttribute('data-wh')){
      const sb=getTextBounds(el);
      (WH_DATA[el.dataset.wh]||[]).forEach(fid=>{
        const fe=filterMap[fid]; if(!fe) return;
        const tb=getTextBounds(fe);
        if(tb.left===undefined) return;
        segs.push({x0:sb.right,y0:midY(sb),x1:tb.left,y1:midY(tb),fid});
      });
    }
  });
  if(!segs.length) return;
  const startTime=performance.now();
  function frame(now) {
    const t=Math.min((now-startTime)/durationMs,1);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    segs.forEach(s=>{ drawSegment(s.x0,s.y0,WH_COLOR,s.x1,s.y1,filterColor(s.fid),1); });
    ctx.save(); ctx.globalCompositeOperation='lighter';
    segs.forEach(s=>{
      const px=s.x0+(s.x1-s.x0)*t, py=s.y0+(s.y1-s.y0)*t;
      drawGlowDot(px,py,WH_COLOR,filterColor(s.fid),t,70,16,0.12,7,0.4,3,0.75);
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
    if(lockedStack.length && !lockAnimating && !pulseGlowAnimId){
      const hasWH=lockedStack.some(el=>el.hasAttribute('data-wh'));
      if(hasWH) firePulseGlow(500);
    }
  }, 5000);
}
function stopPulse() {
  if(pulseInterval){ clearInterval(pulseInterval); pulseInterval=null; }
  if(pulseGlowAnimId){ cancelAnimationFrame(pulseGlowAnimId); pulseGlowAnimId=null; }
}
function stopLines() {
  lineGeneration++;
  if(pulseGlowAnimId){ cancelAnimationFrame(pulseGlowAnimId); pulseGlowAnimId=null; }
  ctx.clearRect(0,0,canvas.width,canvas.height);
}
function resetAll(keepTooltip) {
  stopPulse(); stopLines(); clearHoverColors(); clearDim();
  if(!keepTooltip) hideTooltip();
  allContentEls.forEach(el=>{ el.style.removeProperty('color'); el.style.textShadow=''; });
  lockedEl=null; lockedStack=[]; lockedWHKeys=null; lockedSharedFilters=new Set();
  tableWrap.classList.remove('filter-locked');
  if(!tableWrap.matches(':hover')) tableWrap.classList.remove('table-hovered');
  lockAnimating=false;
  var rl=document.getElementById('reset-lock'); if(rl){ rl.style.opacity='0'; rl.style.pointerEvents='none'; }
  if(window.updateResetBtn) window.updateResetBtn();
}

let lockedSharedFilters = new Set();

function getConnectedWHKeys(el) {
  if(el.hasAttribute('data-wh')) {
    return WH_DATA[el.dataset.wh] ? [el.dataset.wh] : [];
  } else if(el.hasAttribute('data-filter-id')) {
    return REVERSE[el.dataset.filterId] || [];
  }
  return [];
}

function computeStackWHKeys() {
  if(!lockedStack.length) return [];
  let keys=new Set(getConnectedWHKeys(lockedStack[0]));
  for(let i=1;i<lockedStack.length;i++){
    const elKeys=new Set(getConnectedWHKeys(lockedStack[i]));
    keys=new Set([...keys].filter(k=>elKeys.has(k)));
  }
  return [...keys];
}


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

function restoreLockedState() {
  if(!lockedStack.length) return;
  clearHoverColors(); clearDim();
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
  // Color connected sites
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

function activateLock(el) {
  if(lockedStack.includes(el)){
    if(lockedStack.length===1){
      resetAll(true); return;
    }
    lockedStack=lockedStack.filter(e=>e!==el);
    lockedWHKeys=computeStackWHKeys();
    computeSharedFilters();
    restoreLockedState();
    return;
  }
  if(!lockedStack.length){
    resetAll(true);
    tableWrap.classList.add('table-hovered');
    lockedEl=el;
    lockedStack=[el];
    lockedWHKeys=getConnectedWHKeys(el);
    computeSharedFilters();
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
    if(el.hasAttribute('data-filter-id')){
      tableWrap.classList.add('filter-locked');
      setTimeout(()=>{ lockedSharedFilters.forEach(fel=>{ fel.style.opacity='0.5'; }); },0);
    }
  } else {
    lockedStack.push(el);
    lockedWHKeys=computeStackWHKeys();
    computeSharedFilters();
    restoreLockedState();
  }
  var rl=document.getElementById('reset-lock'); if(rl){ rl.style.opacity='1'; rl.style.pointerEvents='auto'; }
  if(window.updateResetBtn) window.updateResetBtn();
  const hasWH=lockedStack.some(e=>e.hasAttribute('data-wh'));
  if(hasWH) startPulse(); else stopPulse();
}

function wireInteractions() {
  document.querySelectorAll('[data-wh]').forEach(whEl => {
    const key=whEl.dataset.wh;
    whEl.addEventListener('mouseenter', e=>{
      lightHeader(whEl);
      showTooltip(key,e);
      if(lockedStack.length) {
        const hasFilterLock=lockedStack.every(el=>el.hasAttribute('data-filter-id'));
        if(!hasFilterLock || !WH_DATA[key]) return;
        // Show hovered wormhole's connections ON TOP of locked state
        if(whListCell) whListCell.classList.remove('soft-reveal-active');
        clearHoverColors(); clearDim();
        const visibleEls=new Set();
        lockedStack.forEach(el=>visibleEls.add(el));
        lockedWHKeys.forEach(k=>{ if(whMap[k]) visibleEls.add(whMap[k]); });
        lockedSharedFilters.forEach(fel=>visibleEls.add(fel));
        visibleEls.add(whEl);
        const whFids=WH_DATA[key];
        whFids.forEach(fid=>{ if(filterMap[fid]) visibleEls.add(filterMap[fid]); });
        allContentEls.forEach(el=>{ if(!visibleEls.has(el)) el.classList.add('dimmed'); });
        const whFidSet=new Set(whFids);
        lockedSharedFilters.forEach(fel=>{
          if(!whFidSet.has(fel.dataset.filterId)) fel.style.opacity='0.5';
        });
        lockedStack.forEach(el=>{
          if(el.hasAttribute('data-filter-id')) applyColor(el,filterColor(el.dataset.filterId));
        });
        lockedWHKeys.forEach(k=>{ const el=whMap[k]; if(el) applyColor(el,WH_COLOR); });
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
      clearHoverColors(); stopLines();
      if(WH_DATA[key]){
        startLinesFromWH(whEl,WH_DATA[key],HOVER_LINE_DRAW_MS,true);
      }
    });
    whEl.addEventListener('mousemove', e=>{ if(tooltipKey===key) positionTooltip(e); });
    whEl.addEventListener('mouseleave', ()=>{
      darkHeader();
      if(lockedStack.length) {
        const hasFilterLock=lockedStack.every(el=>el.hasAttribute('data-filter-id'));
        if(hasFilterLock) {
          clearHoverColors(); clearDim(); stopLines();
          allContentEls.forEach(el=>{ el.style.removeProperty('color'); el.style.textShadow=''; });
          restoreLockedState();
          if(whListCell) whListCell.classList.add('soft-reveal-active');
        }
      } else {
        clearHoverColors(); stopLines();
      }
      hideTooltip();
    });
    whEl.addEventListener('click', e=>{
      e.preventDefault(); e.stopPropagation();
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
      lightHeader(filterEl);
      showTooltip(fid,e);
      if(lockedStack.length) {
        const hasWHLock=lockedStack.some(el=>el.hasAttribute('data-wh'));
        if(hasWHLock) return;
        if(!lockedSharedFilters.has(filterEl)) return;
        const lockedSet=new Set(lockedWHKeys);
        const hoveredKeys=REVERSE[fid]||[];
        const sharedKeys=hoveredKeys.filter(k=>lockedSet.has(k));
        if(!sharedKeys.length) return;
        clearHoverColors();
        clearDim();
        const visibleEls=new Set(sharedKeys.map(k=>whMap[k]).filter(Boolean));
        lockedStack.forEach(el=>visibleEls.add(el));
        visibleEls.add(filterEl);
        allContentEls.forEach(el=>{ if(!visibleEls.has(el)) el.classList.add('dimmed'); });
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
      if(!REVERSE[fid]) return;
      if(lockedStack.length && lockedStack.some(el=>el.hasAttribute('data-wh'))) {
        resetAll(true);
      }
      activateLock(filterEl);
    });
  });

  document.addEventListener('click', e=>{
    if(e.target.closest('#settings-panel') || e.target.closest('#settings-btn') || e.target.closest('#reset-btn')) return;
    if(lockedStack.length && !e.target.closest('.content-row') && !e.target.closest('.header-row') && !e.target.closest('#reset-lock')) resetAll();
  });
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape'){
      if(lockedStack.length) resetAll();
      if(document.activeElement) document.activeElement.blur();
    }
  });
  var rlBtn=document.getElementById('reset-lock');
  if(rlBtn) rlBtn.addEventListener('click', function(e){ e.stopPropagation(); resetAll(); });

  // ── Reset button ────────────────────────────────────────────────────────
  const resetBtn = document.getElementById('reset-btn');
  function updateResetBtn(){
    if(!resetBtn) return;
    if(lockedStack.length){
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
      if(lockedStack.length) resetAll();
      updateResetBtn();
    });
  }
  window.updateResetBtn = updateResetBtn;

  if(whListCell){
    whListCell.addEventListener('mouseenter', ()=>{
      if(!lockedStack.length || !lockedStack.every(el=>el.hasAttribute('data-filter-id'))) return;
      whListCell.classList.add('soft-reveal-active');
    });
    whListCell.addEventListener('mouseleave', ()=>{
      whListCell.classList.remove('soft-reveal-active');
    });
  }
}

function redrawIfActive() {
  if(lockedStack.length){ restoreLockedState(); }
}
window.addEventListener('scroll', redrawIfActive, {passive:true});
window.addEventListener('resize', ()=>{ resizeCanvas(); redrawIfActive(); if(window.updateResetBtn) window.updateResetBtn(); });
window.addEventListener('autofit-done', ()=>{ if(window.updateResetBtn) window.updateResetBtn(); });

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
  const headerTips = {};
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
  if(typeof SITE_ENTRIES==='undefined'){ console.warn('sites.js not loaded.'); wireInteractions(); return; }
  SITE_ENTRIES.forEach(entry=>{ WH_DATA[entry.wormhole]=entryToFilterIds(entry); });
  REVERSE={};
  Object.entries(WH_DATA).forEach(([k,fids])=>{
    fids.forEach(fid=>{ (REVERSE[fid]=REVERSE[fid]||[]).push(k); });
  });
  wireInteractions();
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
