/* ============================================
   WH Kill Widget — Logic

   Usage:
     WHKillWidget.init({
       container: '#wh-kill-widget',
       apiUrl:    'https://api.whtype.info/api/wh-stats',
       pollInterval: 60000  // ms, default 60s
     });
   ============================================ */

const WHKillWidget = (() => {
  let config = {
    container: '#wh-kill-widget',
    apiUrl: '',
    pollInterval: 60000,
    mockData: null
  };

  let elements = {};
  let pollTimer = null;
  let state = 'loading';
  let lastData = null;
  let mode = 'all'; // 'all' or 'pvp'
  let expanded = false;

  const CLASS_ORDER = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'Thera', 'C13', 'Drifters'];

  // --- Formatting helpers ---

  function formatNumber(n) {
    return Number(n).toLocaleString('en-US');
  }

  function formatISK(value) {
    var num, suffix;
    if (value >= 1e12)      { num = (value / 1e12).toFixed(2); suffix = 'T'; }
    else if (value >= 1e9)  { num = (value / 1e9).toFixed(2);  suffix = 'B'; }
    else if (value >= 1e6)  { num = (value / 1e6).toFixed(2);  suffix = 'M'; }
    else if (value >= 1e3)  { num = (value / 1e3).toFixed(1);  suffix = 'K'; }
    else return formatNumber(value);
    return num + '<span class="wh-kill-widget__suffix">' + suffix + '</span>';
  }

  // --- DOM ---

  function buildHTML() {
    return `
      <div class="wh-kill-widget__header">
        <h3 class="wh-kill-widget__title">Wormhole Kills</h3>
        <span class="wh-kill-widget__badge">24h</span>
      </div>
      <div class="wh-kill-widget__toggle-row">
        <button class="wh-kill-widget__toggle" data-wh="toggle" title="Toggle ALL / NON-NPC">
          <span class="wh-kill-widget__toggle-opt wh-kill-widget__toggle-opt--active" data-mode="all">ALL</span>
          <span class="wh-kill-widget__toggle-sep">/</span>
          <span class="wh-kill-widget__toggle-opt" data-mode="pvp">NON-NPC</span>
        </button>
      </div>
      <div class="wh-kill-widget__stats">
        <div class="wh-kill-widget__stat wh-kill-widget__stat--kills">
          <span class="wh-kill-widget__stat-label">Kills</span>
          <span class="wh-kill-widget__stat-value" data-wh="kills">\u2014</span>
        </div>
        <div class="wh-kill-widget__stat wh-kill-widget__stat--isk">
          <span class="wh-kill-widget__stat-label">ISK Destroyed</span>
          <span class="wh-kill-widget__stat-value" data-wh="isk">\u2014</span>
        </div>
        <div class="wh-kill-widget__stat wh-kill-widget__stat--dropped">
          <span class="wh-kill-widget__stat-label">ISK Dropped</span>
          <span class="wh-kill-widget__stat-value" data-wh="dropped">\u2014</span>
        </div>
      </div>
      <div class="wh-kill-widget__divider">
        <button class="wh-kill-widget__expand-btn" data-wh="expand">
          <span class="wh-kill-widget__expand-arrow" data-wh="expand-arrow-l">&#9662;</span>
          <span data-wh="expand-label">Show by class</span>
          <span class="wh-kill-widget__expand-arrow" data-wh="expand-arrow-r">&#9662;</span>
        </button>
      </div>
      <div class="wh-kill-widget__class-table" data-wh="class-table" style="display:none">
        <table>
          <colgroup><col><col><col><col></colgroup>
          <thead>
            <tr>
              <th>Class</th>
              <th>Kills</th>
              <th>Destroyed</th>
              <th>Dropped</th>
            </tr>
          </thead>
          <tbody data-wh="class-tbody"></tbody>
        </table>
      </div>
      <div class="wh-kill-widget__divider wh-kill-widget__divider--bottom" data-wh="collapse-divider" style="display:none">
        <button class="wh-kill-widget__expand-btn" data-wh="collapse">
          <span class="wh-kill-widget__expand-arrow wh-kill-widget__expand-arrow--up">&#9662;</span>
          <span>Hide by class</span>
          <span class="wh-kill-widget__expand-arrow wh-kill-widget__expand-arrow--up">&#9662;</span>
        </button>
      </div>
      <div class="wh-kill-widget__footer">
        <div class="wh-kill-widget__status">
          <span class="wh-kill-widget__dot wh-kill-widget__dot--loading" data-wh="dot"></span>
          <span data-wh="status">Loading...</span>
        </div>
        <span class="wh-kill-widget__source" data-wh="source" style="display:none">Listening <a href="https://zkillboard.com" target="_blank" rel="noopener">zkillboard</a> for data.</span>
      </div>
    `;
  }

  function cacheElements(container) {
    elements.kills   = container.querySelector('[data-wh="kills"]');
    elements.isk     = container.querySelector('[data-wh="isk"]');
    elements.dropped = container.querySelector('[data-wh="dropped"]');
    elements.dot     = container.querySelector('[data-wh="dot"]');
    elements.status  = container.querySelector('[data-wh="status"]');
    elements.source  = container.querySelector('[data-wh="source"]');
    elements.toggle      = container.querySelector('[data-wh="toggle"]');
    elements.expandBtn   = container.querySelector('[data-wh="expand"]');
    elements.expandLabel = container.querySelector('[data-wh="expand-label"]');
    elements.arrowL      = container.querySelector('[data-wh="expand-arrow-l"]');
    elements.arrowR      = container.querySelector('[data-wh="expand-arrow-r"]');
    elements.classTable  = container.querySelector('[data-wh="class-table"]');
    elements.classTbody  = container.querySelector('[data-wh="class-tbody"]');
    elements.collapseDiv = container.querySelector('[data-wh="collapse-divider"]');
    elements.collapseBtn = container.querySelector('[data-wh="collapse"]');
  }

  function render(data) {
    lastData = data;
    displayData();
    setStatus('ok');
  }

  function displayData() {
    if (!lastData) return;
    if (mode === 'pvp') {
      elements.kills.textContent = formatNumber(lastData.pvpKills);
      elements.isk.innerHTML     = formatISK(lastData.pvpIskDestroyed);
      elements.dropped.innerHTML = formatISK(lastData.pvpIskDropped);
    } else {
      elements.kills.textContent = formatNumber(lastData.kills);
      elements.isk.innerHTML     = formatISK(lastData.iskDestroyed);
      elements.dropped.innerHTML = formatISK(lastData.iskDropped);
    }
    if (expanded) renderClassTable();
  }

  function renderClassTable() {
    if (!lastData || !lastData.byClass) return;
    var rows = '';
    for (var i = 0; i < CLASS_ORDER.length; i++) {
      var cls = CLASS_ORDER[i];
      var d = lastData.byClass[cls];
      if (!d) continue;
      var kills = mode === 'pvp' ? d.pvpKills : d.kills;
      var isk   = mode === 'pvp' ? d.pvpIskDestroyed : d.iskDestroyed;
      var drop  = mode === 'pvp' ? d.pvpIskDropped : d.iskDropped;
      if (kills === 0 && isk === 0) continue; // skip empty classes
      rows += '<tr>'
        + '<td class="wh-kill-widget__class-name">' + cls + '</td>'
        + '<td>' + formatNumber(kills) + '</td>'
        + '<td>' + formatISK(isk) + '</td>'
        + '<td>' + formatISK(drop) + '</td>'
        + '</tr>';
    }
    elements.classTbody.innerHTML = rows;
  }

  function setStatus(newState) {
    state = newState;
    const dot = elements.dot;
    dot.className = 'wh-kill-widget__dot';

    if (state === 'error') {
      dot.classList.add('wh-kill-widget__dot--error');
      dot.style.display = '';
      elements.status.style.display = '';
      elements.status.textContent = 'Offline...';
      elements.source.style.display = 'none';
    } else if (state === 'loading') {
      dot.classList.add('wh-kill-widget__dot--loading');
      dot.style.display = '';
      elements.status.style.display = '';
      elements.status.textContent = 'Loading...';
      elements.source.style.display = 'none';
    } else {
      dot.style.display = 'none';
      elements.status.style.display = 'none';
      elements.source.style.display = '';
    }
  }

  // --- Data fetching ---

  async function fetchStats() {
    if (config.mockData) {
      render(config.mockData);
      return;
    }

    try {
      const res = await fetch(config.apiUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      render(data);
    } catch (err) {
      console.error('[WH Widget] Fetch failed:', err.message);
      setStatus('error');
    }
  }

  // --- Lifecycle ---

  function init(userConfig) {
    Object.assign(config, userConfig);

    const container = typeof config.container === 'string'
      ? document.querySelector(config.container)
      : config.container;

    if (!container) {
      console.error('[WH Widget] Container not found:', config.container);
      return;
    }

    container.classList.add('wh-kill-widget');
    container.innerHTML = buildHTML();
    cacheElements(container);

    // Expand / collapse class table
    function toggleExpand() {
      expanded = !expanded;
      elements.classTable.style.display = expanded ? '' : 'none';
      elements.collapseDiv.style.display = expanded ? '' : 'none';
      elements.expandBtn.parentElement.style.display = expanded ? 'none' : '';
      container.classList.toggle('wh-kill-widget--expanded', expanded);
      if (expanded) renderClassTable();
    }
    elements.expandBtn.addEventListener('click', toggleExpand);
    elements.collapseBtn.addEventListener('click', toggleExpand);

    // Toggle PVP / ALL
    elements.toggle.addEventListener('click', function() {
      mode = mode === 'all' ? 'pvp' : 'all';
      var opts = elements.toggle.querySelectorAll('.wh-kill-widget__toggle-opt');
      opts.forEach(function(opt) {
        opt.classList.toggle('wh-kill-widget__toggle-opt--active', opt.dataset.mode === mode);
      });
      displayData();
    });

    fetchStats();

    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(fetchStats, config.pollInterval);
  }

  function destroy() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  return { init, destroy };
})();
