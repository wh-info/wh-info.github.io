// =============================================================================
// modal.js — Settings panel + Info panel logic
// =============================================================================

(function initModals(){
  const btn       = document.getElementById('settings-btn');
  const panel     = document.getElementById('settings-panel');
  const slider    = document.getElementById('fontSlider');
  const fontVal   = document.getElementById('fontVal');
  const monoTog   = document.getElementById('monoToggle');
  const bgTog     = document.getElementById('bgBlackToggle');
  const bwLightSec= document.getElementById('bwLightSection');
  const bwLightTog= document.getElementById('bwLightToggle');
  const boldTog   = document.getElementById('boldToggle');
  const tipTog    = document.getElementById('tooltipToggle');
  const zoomSlider= document.getElementById('zoomSlider');
  const zoomVal   = document.getElementById('zoomVal');
  const tableWrap = document.getElementById('tableWrap');
  if(!btn||!panel) return;

  const THEME_ACCENTS = {
    'wormholer_btw': { accent:'#00c8c8', wh:'#e8d44d', attr:'#00c8c8' },
    'bw':            { accent:'#ffffff', wh:'#ffffff', attr:'#ffffff' },
    'amarr':         { accent:'#e7b815', wh:'#e7b815', attr:'#e7b815' },
    'minmatar':      { accent:'#fe3743', wh:'#fe3743', attr:'#fe3743' },
    'gallente':      { accent:'#00c8a0', wh:'#00c8a0', attr:'#00c8a0' },
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
  let boldHighlights= false;
  let boldBefore    = false;
  const BASE_FONT   = 13;

  // ── Settings Open / Close ─────────────────────────────────────────────────
  function closeSettings(){
    panel.classList.remove('open');
    btn.classList.remove('open');
  }
  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const open = panel.classList.toggle('open');
    btn.classList.toggle('open', open);
  });
  panel.addEventListener('click', (e)=>{
    e.stopPropagation();
  });
  document.addEventListener('click', ()=>{
    if(panel.classList.contains('open')) closeSettings();
  });
  // ── Theme button hover — border matches theme color ───────────────────────
  document.querySelectorAll('.theme-opt').forEach(b=>{
    const c = b.dataset.color;
    b.addEventListener('mouseenter', ()=>{
      const isBwLight = document.documentElement.classList.contains('bw-light');
      b.style.borderColor = (isBwLight && b.dataset.theme === 'bw') ? '#000000' : c;
    });
    b.addEventListener('mouseleave', ()=>{ b.style.removeProperty('border-color'); });
  });

  // ── BW light/dark toggle ──────────────────────────────────────────────────
  function applyBwLight(on){
    bwLight = on;
    document.documentElement.classList.toggle('bw-light', on);
    if(bwLightTog) bwLightTog.classList.toggle('on', on);
    // Light mode: force-enable enhanced highlights and lock toggle
    if(on){ boldBefore=boldHighlights; applyBold(true); if(boldTog) boldTog.classList.add('disabled'); }
    else { applyBold(boldBefore); if(boldTog) boldTog.classList.remove('disabled'); }
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
        if(bwLight){ applyBold(boldBefore); bwLight=false; }
        if(bwLightTog) bwLightTog.classList.remove('on');
        if(boldTog) boldTog.classList.remove('disabled');
      }
    } else {
      monoTog.classList.remove('disabled');
      bgTog.classList.remove('disabled');
      if(boldTog) boldTog.classList.remove('disabled');
      if(prevTheme === 'bw' || prevTheme === 'legacy'){
        applyMono(false);
        applyBgBlack(bgBlackBefore);
        if(prevTheme === 'bw' && bwLight){ applyBold(boldBefore); }
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
    requestAnimationFrame(()=>{ if(typeof redrawIfActive==='function') redrawIfActive(); });
  }
  if(slider) slider.addEventListener('input', ()=>{ applyFontSize(parseInt(slider.value,10)); saveSettings(); });

  // ── Font family selector ────────────────────────────────────────────────────
  const FONT_SIZE_BONUS = {
    "'Roboto Mono'": 0,
    "'IBM Plex Mono'": 0,
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

  // ── Bold Highlights toggle ───────────────────────────────────────────
  function applyBold(on){
    boldHighlights = on;
    document.documentElement.classList.toggle('bold-highlights', on);
    if(boldTog) boldTog.classList.toggle('on', on);
  }
  if(boldTog) boldTog.addEventListener('click', ()=>{
    if(bwLight) return;
    applyBold(!boldHighlights);
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
    val = Math.max(75, Math.min(125, val));
    zoomLevel = val;
    if(tableWrap) tableWrap.style.transform = val === 100 ? '' : 'scale(' + (val/100) + ')';
    if(zoomVal) zoomVal.textContent = val + '%';
    if(zoomSlider) zoomSlider.value = val;
    requestAnimationFrame(()=>{ if(typeof redrawIfActive==='function') redrawIfActive(); });
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
  const resetBtn = document.getElementById('resetSettings');
  function isDefault(){
    return currentTheme === 'wormholer_btw' && !monoMode && !bgBlack && !bwLight
      && !boldHighlights && currentFont === "'Roboto Mono'" && fontOffset === 0
      && tooltipsEnabled && zoomLevel === 100;
  }
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
        boldHighlights: boldHighlights,
        tooltips: tooltipsEnabled,
        zoom: zoomLevel,
      }));
    } catch(e){}
    if(resetBtn) resetBtn.classList.toggle('active', isDefault());
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
      if(s.boldHighlights) applyBold(true);
      if(s.tooltips === false) applyTooltips(false);
      if(typeof s.zoom === 'number' && s.zoom !== 100) applyZoom(s.zoom);
    } catch(e){}
  }
  loadSettings();
  if(resetBtn) resetBtn.classList.toggle('active', isDefault());

  // ── Reset to defaults ──────────────────────────────────────────────────
  function updateDefaultBtn(){
    if(resetBtn) resetBtn.classList.toggle('active', isDefault());
  }
  if(resetBtn) resetBtn.addEventListener('click', ()=>{
    bwLight = false;
    bgBlackBefore = false;
    applyTheme('wormholer_btw');
    applyMono(false);
    applyBold(false);
    applyBgBlack(false);
    applyFont("'Roboto Mono'");
    applyFontSize(0);
    applyTooltips(true);
    applyZoom(100);
    saveSettings();
    updateDefaultBtn();
  });

  // ── Full Screen button ───────────────────────────────────────────────────
  const fsBtn = document.getElementById('fullscreenBtn');
  if(fsBtn){
    function updateFsBtn(){
      fsBtn.style.borderColor = document.fullscreenElement ? 'var(--cyan)' : '';
    }
    fsBtn.addEventListener('click', ()=>{
      closeSettings();
      if(document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    });
    document.addEventListener('fullscreenchange', updateFsBtn);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // INFO MENU + INFO PANEL + INTEL PANEL
  // ═════════════════════════════════════════════════════════════════════════
  const infoBtn     = document.getElementById('info-btn');
  const infoMenu    = document.getElementById('info-menu');
  const infoPanel   = document.getElementById('info-panel');
  const intelPanel  = document.getElementById('intel-panel');
  const infoOverlay = document.getElementById('info-overlay');

  function closeInfoMenu(){
    if(infoMenu) infoMenu.classList.remove('open');
    if(infoBtn) infoBtn.classList.remove('menu-open');
  }
  function closeInfoPanel(){
    if(infoPanel) infoPanel.classList.remove('open');
    if(infoOverlay) infoOverlay.classList.remove('open');
  }
  function closeIntelPanel(){
    if(intelPanel) intelPanel.classList.remove('open');
    if(infoOverlay) infoOverlay.classList.remove('open');
  }

  if(infoBtn && infoMenu){
    infoBtn.addEventListener('click', ()=>{
      infoMenu.classList.toggle('open');
      infoBtn.classList.toggle('menu-open', infoMenu.classList.contains('open'));
    });
  }

  document.querySelectorAll('#info-menu .menu-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      closeInfoMenu();
      const target = item.dataset.panel;
      if(target === 'info'){
        closeIntelPanel();
        if(infoPanel && infoOverlay){
          const open = infoPanel.classList.toggle('open');
          infoOverlay.classList.toggle('open', open);
          if(open){
            document.querySelectorAll('#info-panel .info-tab').forEach(t=>t.classList.remove('active'));
            document.querySelectorAll('#info-panel .info-tab-content').forEach(c=>c.classList.remove('active'));
            const aboutTab = document.querySelector('#info-panel .info-tab[data-tab="about"]');
            const aboutContent = document.getElementById('info-tab-about');
            if(aboutTab) aboutTab.classList.add('active');
            if(aboutContent) aboutContent.classList.add('active');
          }
        }
      } else if(target === 'intel'){
        closeInfoPanel();
        if(intelPanel && infoOverlay){
          const open = intelPanel.classList.toggle('open');
          infoOverlay.classList.toggle('open', open);
          if(open){
            document.querySelectorAll('#intel-panel .intel-tab').forEach(t=>t.classList.remove('active'));
            document.querySelectorAll('#intel-panel .intel-tab-content').forEach(c=>c.classList.remove('active'));
            const reconTab = document.querySelector('#intel-panel .intel-tab[data-tab="recon"]');
            const reconContent = document.getElementById('intel-tab-recon');
            if(reconTab) reconTab.classList.add('active');
            if(reconContent) reconContent.classList.add('active');
          }
        }
      }
    });
  });

  // ── Info panel tabs ──────────────────────────────────────────────────────
  document.querySelectorAll('#info-panel .info-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('#info-panel .info-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('#info-panel .info-tab-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('info-tab-' + tab.dataset.tab);
      if(content) content.classList.add('active');
    });
  });

  // ── Intel panel tabs ─────────────────────────────────────────────────────
  document.querySelectorAll('#intel-panel .intel-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('#intel-panel .intel-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('#intel-panel .intel-tab-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('intel-tab-' + tab.dataset.tab);
      if(content) content.classList.add('active');
    });
  });

  if(infoOverlay){
    infoOverlay.addEventListener('click', ()=>{
      closeInfoPanel();
      closeIntelPanel();
    });
  }

  // Close info menu when clicking outside
  document.addEventListener('click', e=>{
    if(infoMenu && infoMenu.classList.contains('open') &&
       !infoMenu.contains(e.target) && !infoBtn.contains(e.target)){
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

    const updateSeen = localStorage.getItem('whtype-update-v209');
    if(!updateSeen){
      const observer = new MutationObserver(()=>{
        const cl = document.documentElement.classList;
        if(!cl.contains('page-loading')){
          observer.disconnect();
          setTimeout(openUpdate, 300);
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      const cl = document.documentElement.classList;
      if(!cl.contains('page-loading')){
        observer.disconnect();
        setTimeout(openUpdate, 300);
      }
    }

    updateOverlay.addEventListener('click', ()=>{
      closeUpdatePanel();
      localStorage.setItem('whtype-update-v209', '1');
    });
  }

  // ── Auto-fit: compact + zoom so table fits without scrollbars on load ────
  function runAutoFit(){
    if(!tableWrap) return;

    // reset previous auto-fit
    tableWrap.classList.remove('compact');
    document.documentElement.style.zoom = '';

    // wait one frame so layout settles with new viewport dimensions
    requestAnimationFrame(function(){
      function overflows(){
        return document.documentElement.scrollHeight > window.innerHeight
            || document.documentElement.scrollWidth > window.innerWidth;
      }

      // Step 1: if page overflows, apply compact spacing
      if(overflows()){
        tableWrap.classList.add('compact');
      }

      // Step 2: wait another frame, then apply zoom if still needed
      requestAnimationFrame(function(){
        if(overflows()){
          var ratio = Math.min(
            window.innerWidth / document.documentElement.scrollWidth,
            window.innerHeight / document.documentElement.scrollHeight
          );
          ratio = Math.floor(ratio * 100 - 5) / 100;
          document.documentElement.style.zoom = ratio;
        }
        // update settings panel max-height to account for zoom
        var sp = document.getElementById('settings-panel');
        if(sp){
          var zoom = parseFloat(document.documentElement.style.zoom) || 1;
          sp.style.maxHeight = (window.innerHeight / zoom - 20) + 'px';
        }
        // notify app.js that layout is settled
        requestAnimationFrame(function(){
          window.dispatchEvent(new Event('autofit-done'));
        });
      });
    });
  }

  // run auto-fit immediately (table is hidden by page-loading, animation uses % not vw)
  requestAnimationFrame(runAutoFit);

  // re-run when entering/exiting fullscreen
  document.addEventListener('fullscreenchange', function(){
    runAutoFit();
  });

  // re-run on window resize (debounced to avoid thrashing during drag)
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(runAutoFit, 150);
  });
})();
