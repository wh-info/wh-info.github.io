// =============================================================================
// sites.js — Site / exploration data
//
// Fields:
//   safe:      ['SAFE'] or ['NOT SAFE']
//   module:    ['Relic Analyser'], ['Data Analyser'], ['Gas Scoop / Harvester']
//   type:      ['Relic'], ['Data'], ['Drone'], ['Ghost'], ['Gas']
//   appear_in: ['C1','C2','C3','C4','C5','C6','C13','Shattered','HS','LS','NS','Drone Regions']
//   gas:       ['C50','C60','C70','C72','C84','C28','C32','C320','C540']
// =============================================================================

const SITE_ENTRIES = [

  { wormhole:'crumbling',          safe:['SAFE'],     module:['Relic Analyser'],                      type:['Relic'],          appear_in:['HS'], gas:[] },
  { wormhole:'decayed',            safe:['SAFE'],     module:['Relic Analyser'],                      type:['Relic'],          appear_in:['LS'], gas:[] },
  { wormhole:'ruined',             safe:['SAFE'],     module:['Relic Analyser'],                      type:['Relic'],          appear_in:['C1','C2','C3','C13','Shattered','NS'], gas:[] },
  { wormhole:'forgotten',          safe:['NOT SAFE'], module:['Relic Analyser'],                      type:[],                 appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:[] },

  { wormhole:'local',              safe:['SAFE'],     module:['Data Analyser'],                       type:['Data'],           appear_in:['HS'], gas:[] },
  { wormhole:'regional',           safe:['SAFE'],     module:['Data Analyser'],                       type:['Data'],           appear_in:['LS'], gas:[] },
  { wormhole:'central',            safe:['SAFE'],     module:['Data Analyser'],                       type:['Data'],           appear_in:['C1','C2','C3','C13','Shattered','NS'], gas:[] },
  { wormhole:'unsecured',          safe:['NOT SAFE'], module:['Data Analyser'],                       type:[],                 appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:[] },

  { wormhole:'abandoned-research', safe:['NOT SAFE'], module:['Data Analyser'],                       type:['Drone'],          appear_in:['Drone Regions'], gas:[] },
  { wormhole:'silent-battleground',safe:['SAFE'],     module:['Relic Analyser','Data Analyser'],       type:['Relic','Data'],   appear_in:['C13','Shattered'], gas:[] },

  { wormhole:'lesser-covert',      safe:['NOT SAFE'], module:['Data Analyser'],                       type:['Ghost'],          appear_in:['HS'], gas:[] },
  { wormhole:'standard-covert',    safe:['NOT SAFE'], module:['Data Analyser'],                       type:['Ghost'],          appear_in:['LS'], gas:[] },
  { wormhole:'improved-covert',    safe:['NOT SAFE'], module:['Data Analyser'],                       type:['Ghost'],          appear_in:['NS'], gas:[] },
  { wormhole:'superior-covert',    safe:['NOT SAFE'], module:['Data Analyser'],                       type:['Ghost'],          appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:[] },

  { wormhole:'limited-sleeper',    safe:['NOT SAFE'], module:['Relic Analyser','Data Analyser'],       type:[],                 appear_in:['HS','LS','NS'], gas:[] },
  { wormhole:'standard-sleeper',   safe:['NOT SAFE'], module:['Relic Analyser','Data Analyser'],       type:[],                 appear_in:['HS','LS','NS'], gas:[] },
  { wormhole:'superior-sleeper',   safe:['NOT SAFE'], module:['Relic Analyser','Data Analyser'],       type:[],                 appear_in:['HS','LS','NS'], gas:[] },

  { wormhole:'minor-perimeter',    safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:['C70','C72'] },
  { wormhole:'token-perimeter',    safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:['C60','C70'] },
  { wormhole:'barren-perimeter',   safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:['C50','C60'] },
  { wormhole:'ordinary-perimeter', safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:['C72','C84'] },
  { wormhole:'sizeable-perimeter', safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C1','C2','C3','C4','C5','C6','C13','Shattered'], gas:['C50','C84'] },
  { wormhole:'bountiful-frontier', safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C3','C4','C5','C6','C13','Shattered'], gas:['C28','C32'] },
  { wormhole:'vast-frontier',      safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C3','C4','C5','C6','C13','Shattered'], gas:['C28','C32'] },
  { wormhole:'instrumental-core',  safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C5','C6','C13','Shattered'], gas:['C320','C540'] },
  { wormhole:'vital-core',         safe:['NOT SAFE'], module:['Gas Scoop / Harvester'],               type:['Gas'],            appear_in:['C5','C6','C13','Shattered'], gas:['C320','C540'] },

];
