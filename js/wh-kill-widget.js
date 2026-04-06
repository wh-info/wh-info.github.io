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
      <div class="wh-kill-widget__footer">
        <div class="wh-kill-widget__status">
          <span class="wh-kill-widget__dot wh-kill-widget__dot--loading" data-wh="dot"></span>
          <span data-wh="status">Connecting...</span>
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
    elements.status = container.querySelector('[data-wh="status"]');
    elements.source = container.querySelector('[data-wh="source"]');
  }

  function render(data) {
    elements.kills.textContent = formatNumber(data.kills);
    elements.isk.innerHTML     = formatISK(data.iskDestroyed);
    elements.dropped.innerHTML = formatISK(data.iskDropped);
    setStatus('ok');
  }

  function setStatus(newState) {
    state = newState;
    const dot = elements.dot;
    dot.className = 'wh-kill-widget__dot';

    if (state === 'error') {
      dot.classList.add('wh-kill-widget__dot--error');
      dot.style.display = '';
      elements.status.style.display = '';
      elements.status.textContent = 'Offline';
      elements.source.style.display = 'none';
    } else if (state === 'loading') {
      dot.classList.add('wh-kill-widget__dot--loading');
      dot.style.display = '';
      elements.status.style.display = '';
      elements.status.textContent = 'Connecting...';
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
