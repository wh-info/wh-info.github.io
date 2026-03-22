// =============================================================================
// modal.js — Settings panel + Info panel logic
// =============================================================================

(function initModals(){
  const btn       = document.getElementById('settings-btn');
  const panel     = document.getElementById('settings-panel');
  const overlay   = document.getElementById('settings-overlay');
  const slider    = document.getElementById('fontSlider');
  const fontVal   = document.getElementById('fontVal');
  const monoTog   = document.getElementById('monoToggle');
  const bgTog     = document.getElementById('bgBlackToggle');
  const bwLightSec= document.getElementById('bwLightSection');
  const bwLightTog= document.getElementById('bwLightToggle');
  const tipTog    = document.getElementById('tooltipToggle');
  const zoomSlider= document.getElementById('zoomSlider');
  const zoomVal   = document.getElementById('zoomVal');
  const tableWrap = document.getElementById('tableWrap');
  if(!btn||!panel||!overlay) return;

  const THEME_ACCENTS = {
    'wormholer_btw': { accent:'#00c8c8', wh:'#e8d44d', attr:'#00c8c8' },
    'bw':            { accent:'#ffffff', wh:'#ffffff', attr:'#ffffff' },
    'amarr':         { accent:'#e7b815', wh:'#e7b815', attr:'#e7b815' },
    'minmatar':      { accent:'#fe3743', wh:'#fe3743', attr:'#fe3743' },
    'gallente':      { accent:'#00c8a0', wh:'#e8d44d', attr:'#00c8a0' },
    'legacy':        { accent:'#287099', wh:'#e8d44d', attr:'#6bb7d8' },
    'caldari':       { accent:'#00acd1', wh:'#00acd1', attr:'#00acd1' },
  };
  // bw light mode uses inverted accents
  const BW_LIGHT_ACCENTS = { accent:'#000000', wh:'#000000', attr:'#000000' };

  let currentTheme  = 'wormholer_btw';
  let fontOffset    = 0;
  let currentFont   = "'Roboto Mono'";
  let bgBlack       = false;
  let bgBlackBefore = false;
  let bwLight       = false;
  const BASE_FONT   = 13;

  // ── Settings Open / Close ─────────────────────────────────────────────────
  btn.addEventListener('click', ()=>{
    const open = panel.classList.toggle('open');
    overlay.classList.toggle('open', open);
  });
  overlay.addEventListener('click', ()=>{
    panel.classList.remove('open');
    overlay.classList.remove('open');
  });

  // ── Theme button hover — border matches theme color ───────────────────────
  document.querySelectorAll('.theme-opt').forEach(b=>{
    const c = b.dataset.color;
    b.addEventListener('mouseenter', ()=>{ b.style.borderColor = c; });
    b.addEventListener('mouseleave', ()=>{ b.style.removeProperty('border-color'); });
  });

  // ── BW light/dark toggle ──────────────────────────────────────────────────
  function applyBwLight(on){
    bwLight = on;
    document.documentElement.classList.toggle('bw-light', on);
    if(bwLightTog) bwLightTog.classList.toggle('on', on);
    // Light mode: turn off black background; dark mode: restore it
    if(currentTheme === 'bw'){
      applyBgBlack(!on);
      const t = on ? BW_LIGHT_ACCENTS : THEME_ACCENTS['bw'];
      themeAccent = t.accent;
      WH_COLOR = t.wh;
      if(lockedStack.length) restoreLockedState();
    }
  }
  if(bwLightTog) bwLightTog.addEventListener('click', ()=>{
    applyBwLight(!bwLight);
    saveSettings();
  });

  // ── Theme switching ───────────────────────────────────────────────────────
  function applyTheme(name){
    const prevTheme = currentTheme;
    currentTheme = name;
    document.documentElement.classList.forEach(c=>{ if(c.startsWith('theme-')) document.documentElement.classList.remove(c); });
    // Remove bw-light when leaving bw
    if(name !== 'bw') document.documentElement.classList.remove('bw-light');
    if(name !== 'wormholer_btw') document.documentElement.classList.add('theme-'+name);

    // Show/hide bw sub-toggle
    if(bwLightSec) bwLightSec.classList.toggle('visible', name === 'bw');

    if(name === 'bw'){
      bgBlackBefore = bgBlack;
      applyMono(true);
      monoTog.classList.add('disabled');
      applyBgBlack(true);
      bgTog.classList.add('disabled');
      // Restore bw light state if it was saved
      if(bwLight) applyBwLight(true);
    } else if(name === 'legacy'){
      bgBlackBefore = bgBlack;
      applyMono(false);
      monoTog.classList.add('disabled');
      applyBgBlack(true);
      bgTog.classList.add('disabled');
      if(prevTheme === 'bw'){
        bwLight = false;
        if(bwLightTog) bwLightTog.classList.remove('on');
      }
    } else {
      monoTog.classList.remove('disabled');
      bgTog.classList.remove('disabled');
      if(prevTheme === 'bw' || prevTheme === 'legacy'){
        applyMono(false);
        applyBgBlack(bgBlackBefore);
        bwLight = false;
        if(bwLightTog) bwLightTog.classList.remove('on');
      } else if(prevTheme === 'legacy'){
        applyBgBlack(bgBlackBefore);
      }
    }

    const t = (name === 'bw' && bwLight) ? BW_LIGHT_ACCENTS : (THEME_ACCENTS[name] || THEME_ACCENTS['wormholer_btw']);
    themeAccent = t.accent;
    attrFallback = t.attr || t.accent;
    document.documentElement.style.setProperty('--attr-fallback', attrFallback);
    WH_COLOR = monoMode ? t.accent : t.wh;

    document.querySelectorAll('.theme-opt').forEach(b=>{
      b.classList.toggle('active', b.dataset.theme===name);
    });
    if(lockedStack.length) restoreLockedState();
  }
  document.querySelectorAll('.theme-opt').forEach(b=>{
    b.addEventListener('click', ()=>{ applyTheme(b.dataset.theme); saveSettings(); });
  });

  // ── Font size slider ──────────────────────────────────────────────────────
  function applyFontSize(offset){
    fontOffset = offset;
    const bonus = FONT_SIZE_BONUS[currentFont] || 0;
    const size = BASE_FONT + offset + bonus;
    document.querySelectorAll('.wh-row a, .filter-btn').forEach(el=>{
      el.style.fontSize = size + 'px';
    });
    if(fontVal) fontVal.textContent = (offset > 0 ? '+' : '') + offset;
    if(slider) slider.value = offset;
  }
  if(slider) slider.addEventListener('input', ()=>{ applyFontSize(parseInt(slider.value,10)); saveSettings(); });

  // ── Font family selector ────────────────────────────────────────────────────
  const FONT_SIZE_BONUS = {
    "'Roboto Mono'": 0,
    "'IBM Plex Mono'": 1,
    "'Helvetica Neue', Helvetica, Arial": 1,
    "'Exo 2'": 1,
    "'Departure Mono'": 0,
  };
  function applyFont(font){
    currentFont = font;
    const isSans = font.includes('Helvetica') || font.includes('Exo 2');
    const fallback = isSans ? ', sans-serif' : ", 'Courier New', monospace";
    const family = font + fallback;
    const weight = font.includes('Exo 2') ? '600' : '';
    document.body.style.fontFamily = family;
    document.body.style.fontWeight = weight;
    document.querySelectorAll('#settings-panel, #info-panel, .col-header, #eve-clock').forEach(el=>{
      el.style.fontFamily = family;
    });
    document.querySelectorAll('.font-opt').forEach(b=>{
      const bf = b.dataset.font;
      const bSans = bf.includes('Helvetica') || bf.includes('Exo 2');
      const bFallback = bSans ? ', sans-serif' : ", 'Courier New', monospace";
      b.classList.toggle('active', bf === font);
      b.style.fontFamily = bf + bFallback;
    });
    // Re-apply font size with bonus for this font
    applyFontSize(fontOffset);
  }
  document.querySelectorAll('.font-opt').forEach(b=>{
    // Each button renders in its own font
    const bf = b.dataset.font;
    const bSans = bf.includes('Helvetica');
    b.style.fontFamily = bf + (bSans ? ', sans-serif' : ", 'Courier New', monospace");
    b.addEventListener('click', ()=>{ applyFont(bf); saveSettings(); });
  });

  // ── Monochromatic toggle ──────────────────────────────────────────────────
  function applyMono(on){
    monoMode = on;
    monoTog.classList.toggle('on', on);
    const t = THEME_ACCENTS[currentTheme] || THEME_ACCENTS['wormholer_btw'];
    WH_COLOR = on ? t.accent : t.wh;
    if(lockedStack.length) restoreLockedState();
  }
  if(monoTog) monoTog.addEventListener('click', ()=>{
    if(currentTheme === 'bw') return;
    applyMono(!monoMode);
    saveSettings();
  });

  // ── Black background toggle ───────────────────────────────────────────────
  function applyBgBlack(on){
    bgBlack = on;
    document.documentElement.classList.toggle('bg-black', on);
    bgTog.classList.toggle('on', on);
  }
  if(bgTog) bgTog.addEventListener('click', ()=>{
    if(currentTheme === 'bw') return;
    applyBgBlack(!bgBlack);
    saveSettings();
  });

  // ── Tooltips toggle ──────────────────────────────────────────────────
  function applyTooltips(on){
    tooltipsEnabled = on;
    if(tipTog) tipTog.classList.toggle('on', on);
    if(!on) hideTooltip();
  }
  if(tipTog) tipTog.addEventListener('click', ()=>{
    applyTooltips(!tooltipsEnabled);
    saveSettings();
  });

  // ── Zoom slider ─────────────────────────────────────────────────────────
  let zoomLevel = 100;
  function applyZoom(val){
    zoomLevel = val;
    if(tableWrap) tableWrap.style.transform = val === 100 ? '' : 'scale(' + (val/100) + ')';
    if(zoomVal) zoomVal.textContent = val + '%';
    if(zoomSlider) zoomSlider.value = val;
  }
  if(zoomSlider) zoomSlider.addEventListener('input', ()=>{ applyZoom(parseInt(zoomSlider.value,10)); saveSettings(); });

  // ── Settings tooltips ─────────────────────────────────────────────────────
  const monoRow = monoTog ? monoTog.closest('.settings-toggle') : null;
  if(monoRow){
    monoRow.addEventListener('mouseenter', e=>{
      showTooltip('settings-mono', e, 'Remove multiple colors, leaving only a single theme color.');
    });
    monoRow.addEventListener('mousemove', e=>{ if(tooltipKey==='settings-mono') positionTooltip(e); });
    monoRow.addEventListener('mouseleave', ()=>hideTooltip());
  }

  const bgRow = bgTog ? bgTog.closest('.settings-toggle') : null;
  if(bgRow){
    bgRow.addEventListener('mouseenter', e=>{
      showTooltip('settings-bg', e, 'Switch between themed and black backgrounds.');
    });
    bgRow.addEventListener('mousemove', e=>{ if(tooltipKey==='settings-bg') positionTooltip(e); });
    bgRow.addEventListener('mouseleave', ()=>hideTooltip());
  }

  // ── localStorage persistence ──────────────────────────────────────────────
  const STORAGE_KEY = 'whtype-settings';
  function saveSettings(){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        theme: currentTheme,
        fontOffset: fontOffset,
        font: currentFont,
        mono: monoMode,
        bgBlack: bgBlack,
        bgBlackBefore: bgBlackBefore,
        bwLight: bwLight,
        tooltips: tooltipsEnabled,
        zoom: zoomLevel,
      }));
    } catch(e){}
  }
  function loadSettings(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const s = JSON.parse(raw);
      if(s.bgBlackBefore) bgBlackBefore = s.bgBlackBefore;
      if(s.bwLight) bwLight = true;
      if(s.bgBlack && s.theme !== 'bw') applyBgBlack(true);
      if(s.theme && THEME_ACCENTS[s.theme]) applyTheme(s.theme);
      if(typeof s.fontOffset === 'number') applyFontSize(s.fontOffset);
      if(s.font) applyFont(s.font);
      if(s.mono && s.theme !== 'bw') applyMono(true);
      if(s.tooltips === false) applyTooltips(false);
      if(typeof s.zoom === 'number' && s.zoom !== 100) applyZoom(s.zoom);
    } catch(e){}
  }
  loadSettings();

  // ── Reset to defaults ──────────────────────────────────────────────────
  const resetBtn = document.getElementById('resetSettings');
  if(resetBtn) resetBtn.addEventListener('click', ()=>{
    bwLight = false;
    bgBlackBefore = false;
    applyTheme('wormholer_btw');
    applyMono(false);
    applyBgBlack(false);
    applyFont("'Roboto Mono'");
    applyFontSize(0);
    applyTooltips(true);
    applyZoom(100);
    saveSettings();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // INFO MENU + INFO PANEL + CONTENT MODALS
  // ═════════════════════════════════════════════════════════════════════════
  const infoBtn     = document.getElementById('info-btn');
  const infoMenu    = document.getElementById('info-menu');
  const infoPanel   = document.getElementById('info-panel');
  const infoOverlay = document.getElementById('info-overlay');
  const modalOverlay= document.getElementById('modal-overlay');
  const contentModals = document.querySelectorAll('.content-modal');

  function closeInfoMenu(){
    if(infoMenu) infoMenu.classList.remove('open');
  }
  function closeInfoPanel(){
    if(infoPanel) infoPanel.classList.remove('open');
    if(infoOverlay) infoOverlay.classList.remove('open');
  }
  function closeAllModals(){
    contentModals.forEach(m=>m.classList.remove('open'));
    if(modalOverlay) modalOverlay.classList.remove('open');
  }

  if(infoBtn && infoMenu){
    infoBtn.addEventListener('click', ()=>{
      infoMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('#info-menu .menu-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      closeInfoMenu();
      const target = item.dataset.modal;
      if(target === 'about'){
        if(infoPanel && infoOverlay){
          const open = infoPanel.classList.toggle('open');
          infoOverlay.classList.toggle('open', open);
        }
      } else if(target === 'update'){
        if(updatePanel && updateOverlay){
          updatePanel.classList.add('open');
          updateOverlay.classList.add('open');
        }
      } else {
        const modalId = 'modal-' + target;
        const modal = document.getElementById(modalId);
        if(modal && modalOverlay){
          closeAllModals();
          modal.classList.add('open');
          modalOverlay.classList.add('open');
        }
      }
    });
  });

  if(infoOverlay){
    infoOverlay.addEventListener('click', ()=>{
      closeInfoPanel();
    });
  }
  if(modalOverlay){
    modalOverlay.addEventListener('click', ()=>{
      closeAllModals();
    });
  }

  // Close info menu when clicking outside
  document.addEventListener('click', e=>{
    if(infoMenu && infoMenu.classList.contains('open') &&
       !infoMenu.contains(e.target) && e.target !== infoBtn){
      closeInfoMenu();
    }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // UPDATE PANEL — auto-open after page load
  // ═════════════════════════════════════════════════════════════════════════
  const updatePanel   = document.getElementById('update-panel');
  const updateOverlay = document.getElementById('update-overlay');

  function closeUpdatePanel(){
    if(updatePanel)   updatePanel.classList.remove('open');
    if(updateOverlay) updateOverlay.classList.remove('open');
  }

  if(updatePanel && updateOverlay){
    // Auto-open after loading completes (only on first visit)
    function openUpdate(){
      updatePanel.classList.add('open');
      updateOverlay.classList.add('open');
    }

    const updateSeen = localStorage.getItem('whtype-update-seen');
    if(!updateSeen){
      // Wait for page-loading class to be removed
      const observer = new MutationObserver(()=>{
        const cl = document.documentElement.classList;
        if(!cl.contains('page-loading')){
          observer.disconnect();
          setTimeout(openUpdate, 300);
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      // Fallback if class is already gone
      const cl = document.documentElement.classList;
      if(!cl.contains('page-loading')){
        observer.disconnect();
        setTimeout(openUpdate, 300);
      }
    }

    updateOverlay.addEventListener('click', ()=>{
      closeUpdatePanel();
      localStorage.setItem('whtype-update-seen', '1');
    });
  }
})();
