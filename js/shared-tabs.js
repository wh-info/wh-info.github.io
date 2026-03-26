// shared-tabs.js — Shared info-panel tab content + intel panel tabs
// Edit here once, both index.html and safe-explo.html stay in sync.
(function(){
  var intel = {
    'intel-tab-recon':
      '<div class="modal-title">Current investigations</div>' +
      '<hr class="info-sep">' +
      '<p><strong>Medium holes in Nullsec</strong></p>' +
      '<p style="margin-top:14px;">It appears that wandering medium sized wormholes, thought to appear only in Class 1 systems, spawn in NullSec too.</p>' +
      '<p>If you find any of the following wormhole type in NullSec, feel free to send your report with screenshots including system, constelation and region name.</p>' +
      '<p style="margin-bottom:14px;"></p>' +
      '<div class="investigation-list">' +
        '<p><strong>H121</strong> (leads to C1)</p>' +
        '<p><strong>C125</strong> (leads to C2)</p>' +
        '<p><strong>O883</strong> (leads to C3) — <span class="confirmed">CONFIRMED</span></p>' +
        '<p><strong>M609</strong> (leads to C4)</p>' +
        '<p><strong>L614</strong> (leads to C5) — <span class="confirmed">CONFIRMED</span></p>' +
        '<p><strong>S804</strong> (leads to C6) — <span class="confirmed">CONFIRMED</span></p>' +
      '</div>',

    'intel-tab-lexicon':
      '<div class="modal-title">Common wormhole terminology</div>' +
      '<hr class="info-sep">' +
      '<div class="terminology-list">' +
        '<p><strong>Anoikis</strong> — lore name for wormhole space, also known as j-space or w-space.</p>' +
        '<p><strong>Static</strong> — repeatedly respawning wormhole connection in a given j-space system.</p>' +
        '<p><strong>EOL</strong> — end of life; wormhole connection with less than 4 hours of its lifetime left.</p>' +
        '<p><strong>Destab</strong> — wormhole connection with less then 50% of its mass remaining (destabilized).</p>' +
        '<p><strong>Crit</strong> — wormhole connection with less than 10% of its mass remaining (critical).</p>' +
        '<p><strong>Frig hole</strong> — smallest wormhole connection with ship jump size restriction up to Frigates/Destroyers.</p>' +
        '<p><strong>Shattered</strong> — wormhole systems in which all planets are shattered, and any structure is unable to be anchored.</p>' +
        '<p><strong>Roll</strong> — putting enough mass through a wormhole to collapse it.</p>' +
        '<p><strong>Rage roll</strong> — repeatedly rolling one\'s static connection in search for content.</p>' +
        '<p><strong>Rolling battleship</strong> — a battleship of any race fit with a Higgs Anchor rig and battleship propulsion module for rolling wormhole connections.</p>' +
        '<p><strong>Rolling HIC</strong> — Heavy Interdiction Cruiser fit with multiple Zero Point Mass Entanglers, a Higgs Anchor rig and a 100MN Afterburner for rolling medium and crit wormhole connections.</p>' +
        '<p><strong>Zero-Point Mass Entangler</strong> — a high-slot module for Heavy Interdiction Cruisers (HICs) and Odysseus that reduces a ship\'s mass, allowing it to pass through small (frigate-sized) holes.</p>' +
        '<p><strong>Cold pass</strong> — jumping thorugh a wormhole with propulsion module off, which doesn\'t increase ship mass.</p>' +
        '<p><strong>Hot pass</strong> — jumping thorugh a wormhole with propulsion module on, which increase the ship mass.</p>' +
        '<p><strong>Eviction</strong> — act of sieging, destroying and ultimately taking over an enemy wormhole system.</p>' +
        '<p><strong>Hole control</strong> — Holding control of all incoming and outgoing wormhole connections during an eviction to stop enemies from getting in or out.</p>' +
        '<p><strong>Doorstop</strong> — A ship sat on the outside of a crit wormhole connection with enough mass to roll it instantly, used to stop defenders or attackers from bringing in reinforcements.</p>' +
        '<p><strong>K162</strong> — other side of every wormhole type.</p>' +
        '<p><strong>Bob</strong> — egregore, thoughtform, meme and a wormhole god. That is all.</p>' +
      '</div>',

    'intel-tab-k162':
      '<div class="modal-title">K162 spawn mechanics</div>' +
      '<hr class="info-sep">' +
      '<div class="flowchart">' +
        '<svg class="fc-lines" viewBox="0 0 750 510" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
            '<marker id="fc-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">' +
              '<polygon points="0,0 8,3 0,6" fill="currentColor"/>' +
            '</marker>' +
          '</defs>' +
          '<polyline points="375,66 375,96" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<polyline points="245,129 115,129 115,210" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<text class="fc-label" x="163" y="121">YES</text>' +
          '<polyline points="505,129 647,129 647,440" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<text class="fc-label" x="517" y="121">NO</text>' +
          '<polyline points="115,258 115,320" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<polyline points="115,386 115,440" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<text class="fc-label" x="122" y="418">YES</text>' +
          '<polyline points="215,353 270,353" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<text class="fc-label" x="228" y="345">NO</text>' +
          '<polyline points="385,386 385,440" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<text class="fc-label" x="392" y="418">YES</text>' +
          '<polyline points="385,320 385,234 210,234" fill="none" stroke="currentColor" marker-end="url(#fc-arrow)"/>' +
          '<text class="fc-label" x="392" y="282">NO</text>' +
        '</svg>' +
        '<div class="fc-box" style="left:225px;top:0;width:300px;">new wormhole signature appears and is not a K162 exit</div>' +
        '<div class="fc-box fc-decision" style="left:245px;top:96px;width:260px;">did someone initiate warp to it?</div>' +
        '<div class="fc-box" style="left:20px;top:210px;width:190px;">K162 is invisible</div>' +
        '<div class="fc-box fc-decision" style="left:15px;top:320px;width:200px;">did someone jumped through it?</div>' +
        '<div class="fc-box fc-decision" style="left:270px;top:320px;width:230px;">does the wormhole have less then 15h remaining?</div>' +
        '<div class="fc-box" style="left:15px;top:440px;width:200px;">K162 becomes visible</div>' +
        '<div class="fc-box" style="left:260px;top:440px;width:250px;">K162 has a chance of becoming visible every few minutes</div>' +
        '<div class="fc-box" style="left:555px;top:440px;width:185px;">K162 does not exist yet</div>' +
      '</div>' +
      '<div class="fc-footer">' +
        '<p>Flowchart credit goes to <em>Duo Roman</em>, additional info on this <a href="https://forums.eveonline.com/t/k162-spawn-mechanics/8767" target="_blank" rel="noopener">EVE-O forum post</a>.</p>' +
      '</div>' +
      '<hr class="info-sep" style="margin-top:14px;">' +
      '<div class="fc-footer">' +
        '<p><a href="https://www.eveonline.com/news/view/patch-notes-for-hyperion" target="_blank" rel="noopener">Hyperion expansion (Aug 2014) patch note</a>:</p>' +
        '<p>K162 apperance only on first jump (or after first warp and less than 15 hours remaining)</p>' +
      '</div>'
  };

  var tabs = {
    'info-tab-howto':
      '<p class="update-date">Filtering</p>' +
      '<p>Hover over any wormhole type to view its attributes, or hover over an attribute to highlight matching wormhole types.</p>' +
      '<p style="margin-top:14px;">Click an attribute to lock it as an active filter. Related attributes that share the same wormhole types remain visible but appear slightly dimmed. These can still be hovered for preview or selected to further refine the filter. Click a locked attribute again to remove it.</p>' +
      '<p style="margin-top:14px;">While attribute filters are active, you can still hover over any wormhole type to preview its attributes for comparison. However, clicking a wormhole type will override the current filters and lock the display to that specific type.</p>' +
      '<hr class="info-sep">' +
      '<p class="update-date">Searching</p>' +
      '<p>You can search for a specific wormhole type just by typing, which will reveal the search bar. The search field accepts valid wormhole types only. As you type, matching wormholes are highlighted, and you can hover over them to inspect their attributes. When a single matching wormhole remains, its attributes are displayed automatically, as if you were hovering over it.</p>' +
      '<p style="margin-top:14px;">Press Enter to lock onto the selected wormhole type.</p>' +
      '<hr class="info-sep">' +
      '<p class="update-date">Linking</p>' +
      '<p>Whenever you select (lock onto) a wormhole, or when a search results in a single matching type, a LINK button appears. Clicking this button copies a direct URL for that wormhole type to your clipboard, which you can share anywhere.</p>' +
      '<p style="margin-top:14px;">Opening the link will load the site with that specific wormhole type already highlighted.</p>' +
      '<p style="margin-top:14px;">query string looks like this: <span class="info-fake-link">?type=WHTYPE</span></p>' +
      '<p>full URL example: <a href="https://whtype.info?type=A009" target="_blank" rel="noopener">whtype.info?type=A009</a></p>' +
      '<hr class="info-sep">' +
      '<p class="update-date">Reseting</p>' +
      '<p>To clear the search and/or remove all active filters, click outside the table, press <strong>Esc</strong>, or click the <strong>Reset</strong> button on the right side of the table.</p>',

    'info-tab-legal':
      '<div class="info-tip">' +
        '<p>This website does not use cookies.</p>' +
        '<p>It uses cookieless analytics to count visits; feel free to block it.</p>' +
        '<p>Your settings are stored in localStorage; clearing it will reset the site to its default settings.</p>' +
      '</div>' +
      '<div class="info-tip" style="margin-top:14px;">' +
        '<p>All <a href="https://www.eveonline.com/" target="_blank" rel="noopener">EVE Online</a> related materials are property of <a href="https://www.ccpgames.com/" target="_blank" rel="noopener">CCP Games</a>.</p>' +
        '<p style="margin-top:14px;">EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf. All artwork, screenshots, characters, vehicles, storylines, world facts or other recognizable features of the intellectual property relating to these trademarks are likewise the intellectual property of CCP hf. EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide. All other trademarks are the property of their respective owners. CCP is in no way responsible for the content on or functioning of this website, nor can it be liable for any damage arising from the use of this website.</p>' +
      '</div>',

    'info-tab-updates':
      '<p style="margin-bottom:16px;"><strong>wh</strong>type <span style="font-size:0.75em;">v2</span> redesigned</p>' +
      '<div class="update-entry update-old">' +
        '<p class="update-date">03/26/128 YC</p>' +
        '<p>&rarr; Added <strong>search bar</strong> (just start typing!)</p>' +
        '<p>&rarr; Added <strong>Enhanced Highlights</strong> toggle</p>' +
        '<p>&rarr; Improved visual consistency</p>' +
        '<p>&rarr; Bugs booshed</p>' +
        '<hr class="info-sep">' +
        '<p>Details on EVE Online <a href="#" target="_blank" rel="noopener">forum post</a>.</p>' +
      '</div>' +
      '<hr class="info-sep">' +
      '<div class="update-entry update-old">' +
        '<p class="update-date">03/21/128 YC</p>' +
        '<p>&rarr; Added <strong>settings menu</strong> to customize the tool to your preference!</p>' +
        '<p>&rarr; Improved filtering logic!</p>' +
        '<p>&rarr; QOL stuff and more ...</p>' +
        '<p>&rarr; Data updated following the latest patch, as always.</p>' +
        '<hr class="info-sep">' +
        '<p>Details on EVE Online <a href="https://forums.eveonline.com/t/wormholes-by-type-tool/327596/87?u=sothis_ast" target="_blank" rel="noopener">forum post</a>.</p>' +
      '</div>'
  };

  var all = [tabs, intel];
  for(var i = 0; i < all.length; i++){
    for(var id in all[i]){
      var el = document.getElementById(id);
      if(el) el.innerHTML = all[i][id];
    }
  }
})();
