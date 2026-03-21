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
    <p>&rarr; Rarely spawn in <span style="color:#e81e1e;">NullSec</span></p>
  `,

  'B274': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'B449': `
    <p>&rarr; Is static in <span style="color:#f0a800;">Turnur</span> and <span style="color:#f0a800;">Tabbetzur</span> systems</p>
  `,

  'C008': `
    <p>&rarr; Can be <span class="tc">static</span> in C13 systems</p>
  `,

  'C247': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'D382': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'D845': `
    <p>&rarr; Can be <span class="tc">static</span> in shattered <span style="color:#4230cf;">C4</span> systems</p>
  `,

  'E004': `
    <p>&rarr; Can be <span class="tc">static</span> in C13 systems</p>
  `,

  'E175': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> II</p>
    <p>&rarr; <em>Wandering:</em> I</p>
  `,

  'G008': `
    <p>&rarr; Can be <span class="tc">static</span> in C13 systems</p>
  `,

  'H296': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'H900': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> III</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'J377': `
    <p>&rarr; Leads to <span style="color:#f0a800;">Turnur</span> system</p>
  `,

  'J492': `
    <p>&rarr; Leads to <span style="color:#f0a800;">Tabbetzur</span> system</p>
  `,

  'K346': `
    <p>&rarr; Can be <span class="tc">static</span> in shattered <span style="color:#4230cf;">C4</span>, <span style="color:#9c32ed;">C5</span> and <span style="color:#f230dc;">C6</span> systems</p>
  `,

  'L005': `
    <p>&rarr; Can be <span class="tc">static</span> in C13 systems</p>
  `,

  'M001': `
    <p>&rarr; Can be <span class="tc">static</span> in C13 systems</p>
  `,

  'N062': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> III</p>
    <p>&rarr; <em>Wandering:</em> ??</p>
  `,

  'N944': `
    <p>&rarr; Is static in <span style="color:#f0a800;">Turnur</span> and <span style="color:#f0a800;">Tabbetzur</span> systems</p>
  `,

  'O477': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> II</p>
    <p>&rarr; <em>Wandering:</em> I</p>
  `,

  'Q003': `
    <p>&rarr; Can be <span class="tc">static</span> in C13 systems</p>
  `,

  'R474': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> III</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'S199': `
    <p>&rarr; Is static in <span style="color:#f0a800;">Turnur</span> and <span style="color:#f0a800;">Tabbetzur</span> systems</p>
  `,

  'U210': `
    <p>Can be <span class="tc">static</span> in shattered <span style="color:#4230cf;">C4</span> and <span style="color:#9c32ed;">C5</span> systems</p>
  `,

  'U574': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> III</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'V753': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'V911': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'W237': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'X877': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'Y683': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> II</p>
    <p>&rarr; <em>Wandering:</em> I</p>
  `,

  'Z006': `
    <p>&rarr; Can be <span class="tc">static</span> in C13 systems</p>
  `,

  'Z457': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> II</p>
    <p>&rarr; <em>Wandering:</em> I</p>
  `,

  'Z647': `
    <p>Sig level difference:</p>
    <p>&rarr; <em>Static:</em> I</p>
    <p>&rarr; <em>Wandering:</em> II</p>
  `,

  'K162': `
    <p>&rarr; Generic type designating an exit</p>
  `,

  'spawn-c1': `
    <p>&rarr; <em>Regions &amp; constellations:</em> A-</p>
  `,

  'spawn-c2': `
    <p>&rarr; <em>Regions &amp; constellations:</em> B-</p>
  `,

  'spawn-c3': `
    <p>&rarr; <em>Regions &amp; constellations:</em> C-</p>
  `,

  'spawn-c4': `
    <p>&rarr; <em>Regions &amp; constellations:</em> D-</p>
  `,

  'spawn-c5': `
    <p>&rarr; <em>Regions &amp; constellations:</em> E-</p>
  `,

  'spawn-c6': `
    <p>&rarr; <em>Regions &amp; constellations:</em> F-</p>
  `,

  'spawn-hs': `
    <p>&rarr; Class 7</p>
  `,

  'spawn-ls': `
    <p>&rarr; Class 8</p>
  `,

  'spawn-ns': `
    <p>&rarr; Class 9</p>
  `,

  'spawn-thera': `
    <p>Unique shattered wormhole system and only one with a name. Has 4 NPC stations belonging to <em>Sisters of EVE</em>.</p>
    <p>&rarr; <em>Regions &amp; constellations:</em> G-</p>
  `,

  'spawn-shattered': `
    <p>25 shattered wormhole systems accessible only via <span style="color:#1f5eeb;">frigate holes</span>.</p>
    <p>&rarr; <em>System effect:</em> C6 Wolf Rayet</p>
    <p>&rarr; <em>Anomalies:</em> C1-C3</p>
    <p>&rarr; <em>Jcode:</em> starts with 000 (known as Tripnulls)</p>
    <p>&rarr; <em>Regions &amp; constellations:</em> H-</p>
  `,

  'spawn-pochven': `
    <p>Class 25</p>
  `,

  'spawn-drone': `
    <p><span style="color:#e81e1e;">Nullsec regions</span>:</p>
    <p>&rarr; Cobalt Edge, Etherium Reach, Kalevala Expanse,</p>
    <p>&rarr; Malpais, Oasa, Outer Passage, Perrigen Falls, The Spire</p>
  `,

  'spawn-drifter': `
    <p>5 unique shattered wormhole systems, each with its own class and system effect.</p>
    <p>&rarr; Regions &amp; constellations: K-</p>
    <p>&rarr; Class 14-18</p>
  `,

  'spawn-jove': `
    <p>&rarr; These structures are located across <em>known space</em></p>
    <p>&rarr; Referred wormhole types spawn only in systems having them</p>
    <p>First letter in each type reveals the name of a <em>Drifter</em> system destination</p>
  `,

  'spawn-never': `
    <p>bob knows why ...</p>
  `,

  'spawn-exit': `
    <p>Its type originated on the other side.</p>
  `,

  'jump-destroyer': `
    <video src="video/Shole.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
    <p>&rarr; <em>In addition to:</em> Porpoise, HIC and Odysseus</p>
    <p>&rarr; <em>Jump size mass:</em> 5 000 000 kg</p>
    <p>&rarr; <em>Regen per hour:</em> 3 000 000 000 kg</p>
    <p>&rarr; <span style="color:#1f5eeb;">Frigate holes (S)</span>; 00 in each type</p>
  `,

  'jump-bc': `
    <video src="video/Mhole.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
    <p>&rarr; <em>In addition to:</em> DST and Nestor</p>
    <p>&rarr; <em>Jump size mass:</em> 62 000 000 kg</p>
    <p>&rarr; <span style="color:#36cccc;">Medium holes (M)</span></p>
  `,

  'jump-bs': `
    <video src="video/Lhole.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
    <p>&rarr; <em>In addition to:</em> Orca</p>
    <p>&rarr; <em>Jump size mass:</em> 375 000 000 kg</p>
    <p>&rarr; <span style="color:#d6d9cc;">Large holes (L)</span></p>
  `,

  'jump-freighter': `
    <video src="video/xlhole.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
    <p>&rarr; <em>Jump size mass:</em> 1 000 000 000 kg</p>
    <p>&rarr; <span style="color:#f0a800;">Extra Large Holes (XL)</span></p>
  `,

  'jump-capital': `
    <video src="video/xlhole.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
    <p>&rarr; <em>Excluded:</em> Supercarrier and Titan</p>
    <p>&rarr; <em>Jump size mass:</em> 2 000 000 000 kg</p>
    <p>&rarr; <span style="color:#f0a800;">Extra large holes (XL)</span></p>
  `,

  'leads-c1': `
    <video src="video/c1.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-c2': `
    <video src="video/c2.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-c3': `
    <video src="video/c3.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-c4': `
    <video src="video/c4.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-c5': `
    <video src="video/c5.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-c6': `
    <video src="video/c6.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-hs': `
    <p class="tt-title">Empire Space</p>
    <div class="tt-grid">
      <div class="tt-grid-item"><video src="video/caldari.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Caldari</div></div>
      <div class="tt-grid-item"><video src="video/amarr.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Amarr</div></div>
      <div class="tt-grid-item"><video src="video/minmatar.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Minmatar</div></div>
      <div class="tt-grid-item"><video src="video/gallente.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Gallente</div></div>
    </div>
  `,

  'leads-ls': `
    <p class="tt-title">Empire Space</p>
    <div class="tt-grid">
      <div class="tt-grid-item"><video src="video/caldari.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Caldari</div></div>
      <div class="tt-grid-item"><video src="video/amarr.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Amarr</div></div>
      <div class="tt-grid-item"><video src="video/minmatar.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Minmatar</div></div>
      <div class="tt-grid-item"><video src="video/gallente.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video><div class="tt-grid-label">Gallente</div></div>
    </div>
  `,

  'leads-ns': `
    <p>&rarr; Each <span style="color:#e81e1e;">NS</span> region reflects its own nebula on a wormhole</p>
  `,

  'leads-thera': `
    <video src="video/thera.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-c13': `
    <video src="video/c13.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-pochven': `
    <video src="video/pochven.webm" class="vid-xs" width="300" height="300" autoplay loop muted playsinline></video>
  `,

  'leads-sentinel': `
    <p>&rarr; <em>Class:</em> C14</p>
    <p>&rarr; <em>NPC Faction:</em> EDENCOM</p>
    <p>&rarr; <em>System effect:</em> C2 Red Giant</p>
    <p>&rarr; <em>Former Jcode:</em> J055520</p>
  `,

  'leads-barbican': `
    <p>&rarr; <em>Class:</em> C15</p>
    <p>&rarr; <em>NPC Faction:</em> Minmatar</p>
    <p>&rarr; <em>System effect:</em> C2 Cataclysmic Variable</p>
    <p>&rarr; <em>Former Jcode:</em> J110145</p>
  `,

  'leads-vidette': `
    <p>&rarr; <em>Class:</em> C16</p>
    <p>&rarr; <em>NPC Faction:</em> Amarr</p>
    <p>&rarr; <em>System effect:</em> C2 Magnetar</p>
    <p>&rarr; <em>Former Jcode:</em> J164710</p>
  `,

  'leads-eyrie': `
    <p>&rarr; <em>Class:</em> C17</p>
    <p>&rarr; <em>NPC Faction:</em> Caldari</p>
    <p>&rarr; <em>System effect:</em> C2 Pulsar</p>
    <p>&rarr; <em>Former Jcode:</em> J200727</p>
  `,

  'leads-redoubt': `
    <p>&rarr; <em>Class:</em> C18</p>
    <p>&rarr; <em>NPC Faction:</em> Triglavian</p>
    <p>&rarr; <em>System effect:</em> C2 Wolf-Rayet</p>
    <p>&rarr; <em>Former Jcode:</em> J174618</p>
  `,

  'leads-drifter': `
    <p>ccp when?</p>
  `,

  'leads-jump': `
    <p>Make sure to check visual cues and infotab for:</p>
    <p>&rarr; wormhole size and destination</p>
    <p>&rarr; wormhole mass and lifetime left</p>
  `,

  'respawn-reverse': `
    <p>The K162 side behaves as static, reappearing at its destination even though it originates outside of it as a wandering type.</p>
    <p>&rarr; Known as <em>pseudo</em>, <em>reverse</em> or <em>K162 static</em></p>
  `,

  'eve-clock': `
    <p>EVE Standard Time</p>
  `,

};
