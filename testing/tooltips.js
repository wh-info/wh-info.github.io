// =============================================================================
// tooltips.js
//
// Keys: wormhole type (data-wh), filter-id (data-filter-id), or 'eve-clock'
// Values: raw HTML strings
//
// VIDEO SIZING — add a class to <video> or <img>:
//   (none)  → 200px   vid-xs → 120px   vid-sm → 160px
//   vid-md  → 240px   vid-lg → 300px   vid-xl → 340px
// All preserve aspect ratio.
// =============================================================================

const TOOLTIP_CONTENT = {

  'A009': `
    <p>This is a wormhole</p>
  `,

  'spawn-c1': `
    <p>Lowest-difficulty wormhole space. Ideal for new explorers.</p>
    <p><span class="tag" style="background:#42ffec22;color:#42ffec;">C1</span> Solo-friendly</p>
  `,

  'leads-c13': `
    <p>Class 13 wormholes are shattered systems accessible only by frigates and destroyers.</p>
  `,

  'jump-destroyer': `
    <video src="video/Shole.webm" class="vid-xs" autoplay loop muted playsinline style="display:block;margin:0 auto 6px;border:1px dotted #0f2e2e;border-radius:2px;"></video>
    <p>&rarr; <em>In addition to:</em> Porpoise, HIC and Odysseus</p>
    <p>&rarr; <em>Jump size mass:</em> 5 000 000 kg</p>
    <p>&rarr; <em>Regen per hour:</em> 3 000 000 000 kg</p>
    <p>&rarr; <span style="color:#1f5eeb;">Frigate holes (S)</span>; 00 in each type</p>
  `,

  'eve-clock': `
    <p>EVE Standard Time</p>
  `,

};
