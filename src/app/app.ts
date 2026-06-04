import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

type QuoteType = 'double' | 'single';
type UtilityTab = 'quotes' | 'password';
type PasswordSide = 'left' | 'right';
type PasswordCategory = 'lowercase' | 'uppercase' | 'numbers' | 'symbols';
type PasswordStyle = 'random' | 'smooth' | 'passphrase' | 'themed';
type DisruptionPlacement = 'start' | 'betweenWords' | 'random' | 'end';
type EndingPattern = 'none' | 'bangNumber' | 'bangTwoNumbers' | 'custom';
type PassphraseJoin = 'none' | 'hyphen' | 'dot';
type CapitalizationStyle = 'lowercase' | 'title' | 'camel';
type ThemedPassphraseTheme =
  | 'starWars'
  | 'starTrek'
  | 'mechanics'
  | 'it'
  | 'space'
  | 'fantasy'
  | 'ocean'
  | 'forest'
  | 'coffee'
  | 'kitchen'
  | 'music'
  | 'sports';

type PasswordChar = {
  value: string;
  side: PasswordSide;
  category: PasswordCategory;
};

type QuoteOptions = {
  quoteType: QuoteType;
  addCommas: boolean;
  omitLastComma: boolean;
};

type TypingResult = {
  matchedCharacters: number;
  accuracy: number;
  progress: number;
  speed: number;
  isComplete: boolean;
  nextCharacter: string;
  nextSide: PasswordSide | 'done';
  mistypedCharacters: number;
};

const QUOTE_BY_TYPE: Record<QuoteType, string> = {
  double: '"',
  single: "'",
};
const QUOTE_OPTIONS_COOKIE_NAME = 'quoteOptions';
const EDITOR_VISIBLE_ROWS = 16;
const EDITOR_LINE_HEIGHT = 23;
const EDITOR_VERTICAL_PADDING = 12;
const GUTTER_RENDER_BUFFER = 6;
const MAX_REPORTED_ROW_NUMBERS = 200;
const AMBIGUOUS_CHARACTERS = new Set(['0', 'O', 'o', '1', 'l', 'I']);
const PASSWORD_CHARS: PasswordChar[] = [
  ...'qwertasdfgzxcvb'
    .split('')
    .map((value) => ({ value, side: 'left' as const, category: 'lowercase' as const })),
  ...'yuiophjklnm'
    .split('')
    .map((value) => ({ value, side: 'right' as const, category: 'lowercase' as const })),
  ...'QWERTASDFGZXCVB'
    .split('')
    .map((value) => ({ value, side: 'left' as const, category: 'uppercase' as const })),
  ...'YUIOPHJKLNM'
    .split('')
    .map((value) => ({ value, side: 'right' as const, category: 'uppercase' as const })),
  ...'12345'
    .split('')
    .map((value) => ({ value, side: 'left' as const, category: 'numbers' as const })),
  ...'67890'
    .split('')
    .map((value) => ({ value, side: 'right' as const, category: 'numbers' as const })),
  ...'!@#$%'
    .split('')
    .map((value) => ({ value, side: 'left' as const, category: 'symbols' as const })),
  ...'^&*()-_=+[]{};:,.<>/?'
    .split('')
    .map((value) => ({ value, side: 'right' as const, category: 'symbols' as const })),
];
const PHONETIC_CONSONANTS = PASSWORD_CHARS.filter(
  (character) =>
    character.category === 'lowercase' &&
    !'aeiouy'.includes(character.value) &&
    !AMBIGUOUS_CHARACTERS.has(character.value),
);
const PHONETIC_VOWELS = PASSWORD_CHARS.filter(
  (character) =>
    character.category === 'lowercase' &&
    'aeiouy'.includes(character.value) &&
    !AMBIGUOUS_CHARACTERS.has(character.value),
);
const BASE_PASSPHRASE_WORDS = [
  'able',
  'acorn',
  'amber',
  'anchor',
  'apron',
  'atlas',
  'autumn',
  'basil',
  'beacon',
  'binder',
  'blaze',
  'bright',
  'brook',
  'cabin',
  'canvas',
  'cedar',
  'cinder',
  'clover',
  'cobalt',
  'copper',
  'coral',
  'cradle',
  'crisp',
  'cubic',
  'daisy',
  'delta',
  'duel',
  'dual',
  'dune',
  'ember',
  'ever',
  'falcon',
  'fable',
  'flint',
  'forest',
  'frost',
  'fuel',
  'garden',
  'glade',
  'grain',
  'grove',
  'hale',
  'harbor',
  'hazel',
  'honey',
  'honor',
  'ivory',
  'jape',
  'jewel',
  'kale',
  'kernel',
  'lantern',
  'lemon',
  'lunar',
  'maple',
  'marble',
  'meadow',
  'mellow',
  'melon',
  'mesa',
  'meteor',
  'mint',
  'moss',
  'nectar',
  'nova',
  'olive',
  'orbit',
  'opal',
  'orchid',
  'paddle',
  'paper',
  'pepper',
  'plaza',
  'prairie',
  'quartz',
  'raven',
  'reed',
  'river',
  'robin',
  'rocket',
  'rose',
  'saffron',
  'sage',
  'silver',
  'solar',
  'spruce',
  'stone',
  'summit',
  'sunset',
  'thistle',
  'timber',
  'topaz',
  'tulip',
  'umber',
  'valley',
  'velvet',
  'violet',
  'walnut',
  'willow',
  'winter',
  'zebra',
];
const EXTRA_PASSPHRASE_WORDS = [
  'adobe',
  'agile',
  'alder',
  'alpine',
  'amble',
  'archer',
  'ashlar',
  'avenue',
  'bamboo',
  'barley',
  'basalt',
  'bayou',
  'berry',
  'bison',
  'boulder',
  'branch',
  'breeze',
  'briar',
  'bronze',
  'canyon',
  'cargo',
  'chapel',
  'citrus',
  'comet',
  'cotton',
  'creek',
  'crystal',
  'desert',
  'emberfield',
  'fennel',
  'fjord',
  'flame',
  'flora',
  'galaxy',
  'granite',
  'gravel',
  'hearth',
  'hemlock',
  'horizon',
  'inlet',
  'island',
  'jasmine',
  'jasper',
  'juniper',
  'lagoon',
  'laurel',
  'linen',
  'lotus',
  'magnet',
  'mango',
  'maplewood',
  'matrix',
  'meadowlark',
  'meridian',
  'mineral',
  'misty',
  'mosaic',
  'oakwood',
  'obsidian',
  'ocean',
  'olivewood',
  'orchard',
  'pebble',
  'pine',
  'plume',
  'polar',
  'pollen',
  'prism',
  'quarry',
  'quartzite',
  'radius',
  'rain',
  'ravenwood',
  'ripple',
  'salt',
  'satin',
  'shadow',
  'shale',
  'signal',
  'slate',
  'solstice',
  'sparrow',
  'spice',
  'spiral',
  'spring',
  'starling',
  'stream',
  'summer',
  'talon',
  'temple',
  'thunder',
  'tidal',
  'tundra',
  'valleywood',
  'vapor',
  'velvetine',
  'vernal',
  'vista',
  'walnutwood',
  'wander',
  'willowisp',
  'woodland',
  'zircon',
];
const PASSPHRASE_WORDS = [...new Set([...BASE_PASSPHRASE_WORDS, ...EXTRA_PASSPHRASE_WORDS])];
const ALTERNATING_PASSPHRASE_WORDS = PASSPHRASE_WORDS.filter(
  (word) => getAlternationBreakRatio(word) <= 0.55,
);
const THEMED_PASSPHRASE_THEMES: { value: ThemedPassphraseTheme; label: string }[] = [
  { value: 'starWars', label: 'Star Wars' },
  { value: 'starTrek', label: 'Star Trek' },
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'it', label: 'IT' },
  { value: 'space', label: 'Space' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
];
const BASE_THEMED_PASSPHRASE_WORDS: Record<ThemedPassphraseTheme, string[]> = {
  starWars: [
    'alliance',
    'asteroid',
    'blaster',
    'cantina',
    'carbonite',
    'clone',
    'coruscant',
    'droid',
    'endor',
    'ewok',
    'falcon',
    'force',
    'hoth',
    'jawa',
    'jedi',
    'lightsaber',
    'mandalore',
    'naboo',
    'padawan',
    'rebel',
    'republic',
    'saber',
    'sith',
    'skywalker',
    'starfighter',
    'stormtrooper',
    'tatooine',
    'tie',
    'wookiee',
    'xwing',
    'yavin',
  ],
  starTrek: [
    'academy',
    'bridge',
    'captain',
    'communicator',
    'deflector',
    'enterprise',
    'federation',
    'holodeck',
    'impulse',
    'klingon',
    'logbook',
    'nebula',
    'phaser',
    'prime',
    'quadrant',
    'romulan',
    'sensor',
    'shuttle',
    'spock',
    'starbase',
    'starfleet',
    'transport',
    'tricorder',
    'tribble',
    'vulcan',
    'warp',
  ],
  mechanics: [
    'axle',
    'bearing',
    'bracket',
    'caliper',
    'camshaft',
    'clutch',
    'compressor',
    'crankcase',
    'cylinder',
    'differential',
    'driveshaft',
    'flywheel',
    'gasket',
    'gearbox',
    'grease',
    'intake',
    'manifold',
    'motor',
    'piston',
    'ratchet',
    'rotor',
    'socket',
    'sparkplug',
    'sprocket',
    'throttle',
    'torque',
    'valve',
    'wrench',
  ],
  it: [
    'adapter',
    'backup',
    'bandwidth',
    'cache',
    'cluster',
    'console',
    'cron',
    'daemon',
    'database',
    'domain',
    'endpoint',
    'firewall',
    'gateway',
    'kernel',
    'latency',
    'loadbalancer',
    'monitor',
    'network',
    'packet',
    'pipeline',
    'protocol',
    'router',
    'runtime',
    'sandbox',
    'script',
    'server',
    'socket',
    'token',
    'webhook',
  ],
  space: [
    'apollo',
    'asteroid',
    'aurora',
    'comet',
    'cosmos',
    'crater',
    'eclipse',
    'galaxy',
    'gravity',
    'horizon',
    'jupiter',
    'launch',
    'meteor',
    'module',
    'moon',
    'nebula',
    'orbit',
    'payload',
    'planet',
    'quasar',
    'rocket',
    'satellite',
    'shuttle',
    'solar',
    'starlight',
    'telescope',
    'trajectory',
    'zenith',
  ],
  fantasy: [
    'alchemy',
    'amulet',
    'archer',
    'castle',
    'cavern',
    'citadel',
    'crystal',
    'dragon',
    'druid',
    'ember',
    'enchant',
    'fae',
    'glyph',
    'griffin',
    'knight',
    'lantern',
    'mage',
    'merlin',
    'moonstone',
    'oracle',
    'paladin',
    'phoenix',
    'ranger',
    'rune',
    'spell',
    'tower',
    'wizard',
  ],
  ocean: [
    'anchor',
    'atoll',
    'bay',
    'beacon',
    'breaker',
    'captain',
    'channel',
    'compass',
    'coral',
    'current',
    'harbor',
    'island',
    'lagoon',
    'lighthouse',
    'marina',
    'nautical',
    'oyster',
    'pier',
    'reef',
    'rigging',
    'sail',
    'seabreeze',
    'shell',
    'tide',
    'voyage',
    'wave',
  ],
  forest: [
    'acorn',
    'aspen',
    'bark',
    'birch',
    'branch',
    'canopy',
    'cedar',
    'clover',
    'fern',
    'grove',
    'hazel',
    'hemlock',
    'ivy',
    'juniper',
    'maple',
    'meadow',
    'moss',
    'oak',
    'pine',
    'river',
    'root',
    'spruce',
    'thicket',
    'trail',
    'willow',
    'woodland',
  ],
  coffee: [
    'arabica',
    'barista',
    'bean',
    'blend',
    'brew',
    'carafe',
    'cortado',
    'crema',
    'drip',
    'espresso',
    'filter',
    'grinder',
    'latte',
    'macchiato',
    'mocha',
    'mug',
    'percolator',
    'pour',
    'roast',
    'siphon',
    'steam',
    'tamper',
  ],
  kitchen: [
    'apron',
    'basil',
    'braise',
    'broiler',
    'caramel',
    'cleaver',
    'cuttingboard',
    'garlic',
    'griddle',
    'ladle',
    'marinade',
    'mixer',
    'pepper',
    'platter',
    'rosemary',
    'saute',
    'simmer',
    'skillet',
    'spatula',
    'stockpot',
    'thyme',
    'whisk',
  ],
  music: [
    'acoustic',
    'album',
    'amplifier',
    'anthem',
    'bass',
    'bridge',
    'cadence',
    'chorus',
    'chord',
    'cymbal',
    'drum',
    'fret',
    'groove',
    'harmony',
    'keyboard',
    'melody',
    'metronome',
    'octave',
    'rhythm',
    'riff',
    'scale',
    'solo',
    'tempo',
    'verse',
  ],
  sports: [
    'arena',
    'assist',
    'baseline',
    'bat',
    'bench',
    'coach',
    'defense',
    'dugout',
    'field',
    'goal',
    'helmet',
    'huddle',
    'jersey',
    'league',
    'medal',
    'offense',
    'pitch',
    'playbook',
    'rally',
    'referee',
    'scoreboard',
    'sprint',
    'stadium',
    'tackle',
    'trophy',
    'whistle',
  ],
};
const EXTRA_THEMED_PASSPHRASE_WORDS: Record<ThemedPassphraseTheme, string[]> = {
  starWars: [
    'alderaan',
    'anakin',
    'andor',
    'ahsoka',
    'bacta',
    'bantha',
    'beskar',
    'boba',
    'bothan',
    'chewbacca',
    'dagobah',
    'darksaber',
    'deathstar',
    'emperor',
    'empire',
    'exegol',
    'geonosis',
    'grogu',
    'gunship',
    'hyperspace',
    'imperial',
    'inquisitor',
    'kenobi',
    'kyber',
    'lando',
    'leia',
    'luke',
    'maul',
    'millennium',
    'mustafar',
    'obiwan',
    'palpatine',
    'plo',
    'podracer',
    'rancor',
    'resistance',
    'scarif',
    'senate',
    'snowspeeder',
    'stardestroyer',
    'starship',
    'tauntaun',
    'thrawn',
    'tusken',
    'vader',
    'windu',
    'yoda',
  ],
  starTrek: [
    'admiral',
    'andorian',
    'awayteam',
    'bajor',
    'borg',
    'cardassian',
    'chekov',
    'datasoong',
    'datapad',
    'deepspace',
    'dilithium',
    'dockyard',
    'doctor',
    'earthfleet',
    'excelsior',
    'ferengi',
    'firstcontact',
    'galaxyclass',
    'geordi',
    'janeway',
    'kirk',
    'lcars',
    'mccoy',
    'nacelle',
    'picard',
    'ponfarr',
    'promenade',
    'qonos',
    'riker',
    'saucer',
    'scotty',
    'sisko',
    'subspace',
    'targ',
    'tenforward',
    'torpedo',
    'transporter',
    'uhura',
    'voyager',
    'worf',
  ],
  mechanics: [
    'alternator',
    'balljoint',
    'belt',
    'bleeder',
    'brakepad',
    'bushing',
    'carburetor',
    'chassis',
    'coolant',
    'coupler',
    'dipstick',
    'exhaust',
    'filter',
    'fuse',
    'garage',
    'injector',
    'jackstand',
    'lugnut',
    'muffler',
    'oilpan',
    'pinion',
    'pulley',
    'radiator',
    'relay',
    'rim',
    'seal',
    'serpentine',
    'shifter',
    'strut',
    'suspension',
    'tachometer',
    'thermostat',
    'timingbelt',
    'tire',
    'transaxle',
    'transmission',
    'turbo',
    'voltage',
    'washer',
    'wheelhub',
  ],
  it: [
    'apikey',
    'auth',
    'binary',
    'bitrate',
    'branch',
    'browser',
    'build',
    'cipher',
    'cloud',
    'commit',
    'container',
    'cookie',
    'deploy',
    'dns',
    'docker',
    'driver',
    'ethernet',
    'frontend',
    'git',
    'hash',
    'hostname',
    'http',
    'instance',
    'interface',
    'json',
    'lambda',
    'linux',
    'middleware',
    'module',
    'namespace',
    'proxy',
    'queue',
    'registry',
    'request',
    'response',
    'secret',
    'service',
    'session',
    'ssh',
    'stack',
    'subnet',
    'sync',
    'terminal',
    'thread',
    'tls',
    'upload',
    'version',
    'virtual',
    'worker',
    'yaml',
  ],
  space: [
    'andromeda',
    'astronaut',
    'atmosphere',
    'booster',
    'capsule',
    'celestial',
    'centauri',
    'command',
    'constellation',
    'cosmonaut',
    'docking',
    'earthrise',
    'engine',
    'europa',
    'expedition',
    'ganymede',
    'lander',
    'liftoff',
    'mars',
    'mercury',
    'milkyway',
    'mission',
    'neptune',
    'observatory',
    'orion',
    'perigee',
    'probe',
    'propellant',
    'saturn',
    'solstice',
    'spaceport',
    'spacesuit',
    'starfield',
    'station',
    'thruster',
    'titan',
    'uranus',
    'venus',
    'voyager',
  ],
  fantasy: [
    'apprentice',
    'arcane',
    'bard',
    'battlement',
    'blade',
    'broadsword',
    'candle',
    'cauldron',
    'cloak',
    'crown',
    'dagger',
    'dungeon',
    'elixir',
    'familiar',
    'fortress',
    'goblet',
    'guardian',
    'halberd',
    'healer',
    'helm',
    'keep',
    'legend',
    'manor',
    'mythic',
    'potion',
    'quest',
    'relic',
    'scepter',
    'shield',
    'sigil',
    'sorcerer',
    'staff',
    'talisman',
    'tavern',
    'throne',
    'vault',
    'ward',
  ],
  ocean: [
    'abyss',
    'barge',
    'barnacle',
    'bilge',
    'boathouse',
    'buoy',
    'catamaran',
    'clam',
    'coast',
    'cove',
    'deck',
    'dolphin',
    'dory',
    'estuary',
    'fathom',
    'flotsam',
    'galleon',
    'gulf',
    'helm',
    'hull',
    'jetty',
    'keel',
    'knot',
    'mainsail',
    'mast',
    'mooring',
    'oceanic',
    'port',
    'regatta',
    'rudder',
    'schooner',
    'seaglass',
    'seaway',
    'sextant',
    'shipyard',
    'starboard',
    'surf',
    'trawler',
    'wharf',
  ],
  forest: [
    'alder',
    'animal',
    'bramble',
    'brook',
    'buckeye',
    'campfire',
    'chestnut',
    'conifer',
    'creek',
    'cypress',
    'deerpath',
    'elm',
    'evergreen',
    'fieldstone',
    'fir',
    'foxglove',
    'glade',
    'hickory',
    'hollow',
    'leaf',
    'lichen',
    'mushroom',
    'needle',
    'orchard',
    'pathway',
    'redwood',
    'sapling',
    'shade',
    'sorrel',
    'stump',
    'sycamore',
    'timber',
    'underbrush',
    'violet',
    'waterfall',
    'wildflower',
  ],
  coffee: [
    'affogato',
    'bloom',
    'caffeine',
    'chemex',
    'cupping',
    'decaf',
    'doppio',
    'flatwhite',
    'frenchpress',
    'grounds',
    'hario',
    'kettle',
    'lungo',
    'microfoam',
    'nitro',
    'portafilter',
    'ristretto',
    'robusta',
    'roastery',
    'scale',
    'shot',
    'singleorigin',
    'spro',
    'timer',
    'v60',
  ],
  kitchen: [
    'baker',
    'batter',
    'biscuit',
    'broth',
    'colander',
    'dough',
    'dutchoven',
    'fennel',
    'flour',
    'fryer',
    'ginger',
    'grater',
    'knead',
    'lemon',
    'measuringcup',
    'oven',
    'paprika',
    'parchment',
    'pastry',
    'peppermill',
    'ramekin',
    'recipe',
    'rollingpin',
    'saucepan',
    'sifter',
    'spice',
    'strainer',
    'tongs',
    'zester',
  ],
  music: [
    'arpeggio',
    'ballad',
    'baritone',
    'beat',
    'cello',
    'crescendo',
    'deck',
    'delay',
    'distortion',
    'downbeat',
    'duet',
    'echo',
    'equalizer',
    'fader',
    'guitar',
    'headstock',
    'hook',
    'lyric',
    'major',
    'measure',
    'minor',
    'mixdown',
    'pickup',
    'piano',
    'playlist',
    'reverb',
    'saxophone',
    'setlist',
    'soprano',
    'sustain',
    'synth',
    'track',
    'tuning',
    'violin',
  ],
  sports: [
    'athlete',
    'backboard',
    'bullpen',
    'catcher',
    'cleats',
    'court',
    'drive',
    'faceoff',
    'fastball',
    'finishline',
    'freethrow',
    'glove',
    'halftime',
    'keeper',
    'kickoff',
    'lap',
    'lineman',
    'locker',
    'match',
    'net',
    'outfield',
    'overtime',
    'paddock',
    'penalty',
    'podium',
    'quarter',
    'receiver',
    'record',
    'roster',
    'sideline',
    'striker',
    'timeout',
    'track',
    'umpire',
    'victory',
  ],
};
const THEMED_PASSPHRASE_WORDS = Object.fromEntries(
  THEMED_PASSPHRASE_THEMES.map(({ value }) => [
    value,
    [...new Set([...BASE_THEMED_PASSPHRASE_WORDS[value], ...EXTRA_THEMED_PASSPHRASE_WORDS[value]])],
  ]),
) as Record<ThemedPassphraseTheme, string[]>;
const ALTERNATING_THEMED_PASSPHRASE_WORDS = Object.fromEntries(
  Object.entries(THEMED_PASSPHRASE_WORDS).map(([theme, words]) => [
    theme,
    words.filter((word) => getAlternationBreakRatio(word) <= 0.55),
  ]),
) as Record<ThemedPassphraseTheme, string[]>;
const AWKWARD_CHARACTERS = new Set(['q', 'Q', 'p', 'P', 'z', 'Z', '/', '?', '[', ']', '{', '}']);

function getCharacterSide(character: string): PasswordSide {
  return PASSWORD_CHARS.find((entry) => entry.value === character)?.side ?? 'right';
}

function getAlternationBreakRatio(value: string): number {
  const rhythm = value
    .split('')
    .filter((character) => /[a-z]/i.test(character))
    .map((character) => getCharacterSide(character));

  if (rhythm.length < 2) {
    return 0;
  }

  let breaks = 0;
  for (let index = 1; index < rhythm.length; index += 1) {
    if (rhythm[index] === rhythm[index - 1]) {
      breaks += 1;
    }
  }

  return breaks / (rhythm.length - 1);
}

function getAlternationBreakCount(value: string): number {
  const rhythm = value
    .split('')
    .filter((character) => /[a-z]/i.test(character))
    .map((character) => getCharacterSide(character));
  let breaks = 0;

  for (let index = 1; index < rhythm.length; index += 1) {
    if (rhythm[index] === rhythm[index - 1]) {
      breaks += 1;
    }
  }

  return breaks;
}

type TextStats = {
  rows: number;
  characters: number;
  words: number;
};

type InputInsights = {
  blankLines: number;
  blankLineRows: number[];
  blankLineOverflow: number;
  duplicateRows: number;
  whitespaceRows: number[];
  whitespaceOverflow: number;
  whitespaceRowCount: number;
};

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly snackBar = inject(MatSnackBar);
  private readonly inputTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('inputTextarea');

  protected readonly inputText = signal('');
  protected readonly activeUtility = signal<UtilityTab>('quotes');
  protected readonly quoteType = signal<QuoteType>('double');
  protected readonly addCommas = signal(true);
  protected readonly omitLastComma = signal(true);
  protected readonly copied = signal(false);
  protected readonly passwordCopied = signal(false);
  protected readonly generatedPassword = signal('');
  protected readonly passwordLength = signal(18);
  protected readonly includeLowercase = signal(true);
  protected readonly includeUppercase = signal(true);
  protected readonly includeNumbers = signal(true);
  protected readonly includeSymbols = signal(true);
  protected readonly alternateHands = signal(true);
  protected readonly passwordStyle = signal<PasswordStyle>('passphrase');
  protected readonly themedPassphraseThemes = THEMED_PASSPHRASE_THEMES;
  protected readonly themedPassphraseTheme = signal<ThemedPassphraseTheme>('starWars');
  protected readonly smoothness = signal(80);
  protected readonly passphraseWordCount = signal(3);
  protected readonly passphraseJoin = signal<PassphraseJoin>('none');
  protected readonly capitalizationStyle = signal<CapitalizationStyle>('camel');
  protected readonly endingPattern = signal<EndingPattern>('bangNumber');
  protected readonly numberCharacterCount = signal(1);
  protected readonly symbolCharacterCount = signal(1);
  protected readonly numberPlacement = signal<DisruptionPlacement>('end');
  protected readonly symbolPlacement = signal<DisruptionPlacement>('end');
  protected readonly avoidAmbiguous = signal(true);
  protected readonly avoidAwkwardKeys = signal(true);
  protected readonly typingInput = signal('');
  protected readonly typingStartedAt = signal(0);
  protected readonly typingElapsedMs = signal(0);
  protected readonly isNavHidden = signal(false);
  protected readonly inputScrollTop = signal(0);
  protected readonly resultScrollTop = signal(0);

  private lastScrollY = 0;
  private copiedTimer: ReturnType<typeof setTimeout> | undefined;
  private passwordCopiedTimer: ReturnType<typeof setTimeout> | undefined;
  private recentPassphraseWords: string[] = [];

  protected readonly resultText = computed(() => {
    const inputText = this.inputText();

    if (!inputText) {
      return '';
    }

    const quote = QUOTE_BY_TYPE[this.quoteType()];
    const rows = inputText.split(/\r?\n/);
    const addCommas = this.addCommas();
    const omitLastComma = this.omitLastComma();
    const formattedRows = new Array<string>(rows.length);

    for (let index = 0; index < rows.length; index += 1) {
      const formatted = `${quote}${rows[index]}${quote}`;
      const shouldAddComma = addCommas && (!omitLastComma || index < rows.length - 1);

      formattedRows[index] = shouldAddComma ? `${formatted},` : formatted;
    }

    return formattedRows.join('\n');
  });

  protected readonly inputStats = computed(() => this.getStats(this.inputText()));
  protected readonly resultStats = computed(() => this.getStats(this.resultText()));
  protected readonly inputInsights = computed(() => this.getInputInsights());
  protected readonly selectedPasswordCategories = computed(() => {
    const categories: PasswordCategory[] = [];

    if (this.includeLowercase()) {
      categories.push('lowercase');
    }
    if (this.includeUppercase()) {
      categories.push('uppercase');
    }
    if (this.includeNumbers()) {
      categories.push('numbers');
    }
    if (this.includeSymbols()) {
      categories.push('symbols');
    }

    return categories;
  });
  protected readonly passwordStrengthLabel = computed(() => {
    const entropy = this.estimatedEntropy();

    if (entropy >= 96) {
      return 'Excellent';
    }
    if (entropy >= 72) {
      return 'Strong';
    }
    if (entropy >= 48) {
      return 'Solid';
    }
    return 'Light';
  });
  protected readonly typingResult = computed<TypingResult>(() => {
    const target = this.generatedPassword();
    const input = this.typingInput();
    const elapsedSeconds = this.typingElapsedMs() > 0 ? this.typingElapsedMs() / 1000 : 0;
    let matchedCharacters = 0;
    let mistypedCharacters = 0;

    for (let index = 0; index < input.length; index += 1) {
      if (input[index] === target[index]) {
        matchedCharacters += 1;
      } else {
        mistypedCharacters += 1;
      }
    }

    const progress = target.length ? Math.min(input.length / target.length, 1) : 0;
    const accuracy = input.length ? Math.round((matchedCharacters / input.length) * 100) : 100;
    const nextCharacter = target[input.length] ?? '';

    return {
      matchedCharacters,
      accuracy,
      progress,
      speed: elapsedSeconds ? Math.round((matchedCharacters / elapsedSeconds) * 60) : 0,
      isComplete: target.length > 0 && input === target,
      nextCharacter,
      nextSide: nextCharacter ? this.getKeySide(nextCharacter) : 'done',
      mistypedCharacters,
    };
  });
  protected readonly passwordRhythm = computed(() =>
    this.generatedPassword()
      .split('')
      .map((character) => this.getKeySide(character)),
  );
  protected readonly inputLineNumbers = computed(() =>
    this.getVisibleLineNumbers(this.inputStats().rows, this.inputScrollTop()),
  );
  protected readonly resultLineNumbers = computed(() =>
    this.getVisibleLineNumbers(this.resultStats().rows, this.resultScrollTop()),
  );
  protected readonly inputGutterOffset = computed(() =>
    this.getGutterOffset(this.inputLineNumbers()[0] ?? 1, this.inputScrollTop()),
  );
  protected readonly resultGutterOffset = computed(() =>
    this.getGutterOffset(this.resultLineNumbers()[0] ?? 1, this.resultScrollTop()),
  );

  constructor() {
    const savedQuoteOptions = this.readQuoteOptionsCookie();

    if (savedQuoteOptions) {
      this.quoteType.set(savedQuoteOptions.quoteType);
      this.addCommas.set(savedQuoteOptions.addCommas);
      this.omitLastComma.set(savedQuoteOptions.omitLastComma);
    }

    this.generatePassword();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    const currentScrollY = Math.max(window.scrollY, 0);
    const hasMovedEnough = Math.abs(currentScrollY - this.lastScrollY) > 6;

    if (hasMovedEnough) {
      this.isNavHidden.set(currentScrollY > this.lastScrollY && currentScrollY > 96);
      this.lastScrollY = currentScrollY;
    }
  }

  protected async pasteInput(): Promise<void> {
    try {
      if (!navigator.clipboard?.readText) {
        throw new Error('Clipboard API unavailable.');
      }

      const text = await navigator.clipboard?.readText();
      this.inputText.set(text ?? '');
    } catch {
      this.inputTextarea()?.nativeElement.focus();
      this.showMessage(
        'Browser blocked clipboard access. The input is focused; press Cmd+V to paste.',
      );
    }
  }

  protected setInputScroll(event: Event): void {
    this.inputScrollTop.set((event.target as HTMLTextAreaElement).scrollTop);
  }

  protected setInputText(event: Event): void {
    this.inputText.set((event.target as HTMLTextAreaElement).value);
  }

  protected setPasswordLength(event: Event): void {
    const length = Number((event.target as HTMLInputElement).value);
    this.passwordLength.set(Math.min(Math.max(length || 8, 8), 48));
  }

  protected setSmoothness(event: Event): void {
    const smoothness = Number((event.target as HTMLInputElement).value);
    this.smoothness.set(Math.min(Math.max(smoothness || 0, 0), 100));
  }

  protected setPassphraseWordCount(event: Event): void {
    const count = Number((event.target as HTMLInputElement).value);
    this.passphraseWordCount.set(Math.min(Math.max(count || 2, 2), 4));
  }

  protected setNumberCharacterCount(event: Event): void {
    const count = Number((event.target as HTMLInputElement).value);
    this.numberCharacterCount.set(Math.min(Math.max(count || 0, 0), 8));
  }

  protected setSymbolCharacterCount(event: Event): void {
    const count = Number((event.target as HTMLInputElement).value);
    this.symbolCharacterCount.set(Math.min(Math.max(count || 0, 0), 8));
  }

  protected setTypingInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const now = Date.now();

    if (!this.typingStartedAt() && value.length) {
      this.typingStartedAt.set(now);
    }

    if (!value.length) {
      this.typingStartedAt.set(0);
      this.typingElapsedMs.set(0);
    } else {
      this.typingElapsedMs.set(now - this.typingStartedAt());
    }

    this.typingInput.set(value);
  }

  protected setResultScroll(event: Event): void {
    this.resultScrollTop.set((event.target as HTMLTextAreaElement).scrollTop);
  }

  protected clearInput(): void {
    this.inputText.set('');
  }

  protected removeQuotesAndCommas(): void {
    this.inputText.update((value) => value.replace(/[,"'`]/g, ''));
  }

  protected trimRows(): void {
    const rowsWithWhitespace = this.getInputInsights().whitespaceRowCount;

    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .map((row) => row.trim())
        .join('\n'),
    );

    this.showMessage(
      rowsWithWhitespace
        ? `Cleared leading/trailing whitespace from ${rowsWithWhitespace} row${rowsWithWhitespace === 1 ? '' : 's'}.`
        : 'No leading or trailing whitespace found.',
    );
  }

  protected deduplicateRows(): void {
    const seen = new Set<string>();
    let removedRows = 0;

    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .filter((row) => {
          const key = row.trim();

          if (!key) {
            return true;
          }

          if (seen.has(key)) {
            removedRows += 1;
            return false;
          }

          seen.add(key);
          return true;
        })
        .join('\n'),
    );

    this.showMessage(
      removedRows
        ? `Removed ${removedRows} duplicate row${removedRows === 1 ? '' : 's'}.`
        : 'No duplicate rows found.',
    );
  }

  protected removeEmptyRows(): void {
    let removedRows = 0;

    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .filter((row) => {
          if (!row.trim()) {
            removedRows += 1;
            return false;
          }

          return true;
        })
        .join('\n'),
    );

    this.showMessage(
      removedRows
        ? `Removed ${removedRows} empty row${removedRows === 1 ? '' : 's'}.`
        : 'No empty rows found.',
    );
  }

  protected sortRows(): void {
    this.inputText.update((value) =>
      value
        .split(/\r?\n/)
        .sort((first, second) => first.trim().localeCompare(second.trim()))
        .join('\n'),
    );
  }

  protected async copyResult(): Promise<void> {
    await navigator.clipboard?.writeText(this.resultText());
    this.copied.set(true);

    if (this.copiedTimer) {
      clearTimeout(this.copiedTimer);
    }

    this.copiedTimer = setTimeout(() => this.copied.set(false), 1400);
  }

  protected generatePassword(): void {
    const categories = this.selectedPasswordCategories();

    if (!categories.length) {
      this.includeLowercase.set(true);
      categories.push('lowercase');
    }
    if (this.passwordStyle() !== 'random' && !this.hasLetterCategory(categories)) {
      this.includeLowercase.set(true);
      categories.push('lowercase');
    }

    const pool = this.getPasswordPool(categories);
    if (!pool.length) {
      this.showMessage('No matching password characters are available with those options.');
      return;
    }

    this.generatedPassword.set(this.buildStyledPassword(pool, categories));
    this.resetTypingTest();
  }

  protected async copyPassword(): Promise<void> {
    const password = this.generatedPassword();

    if (!password) {
      return;
    }

    await navigator.clipboard?.writeText(password);
    this.passwordCopied.set(true);

    if (this.passwordCopiedTimer) {
      clearTimeout(this.passwordCopiedTimer);
    }

    this.passwordCopiedTimer = setTimeout(() => this.passwordCopied.set(false), 1400);
  }

  protected resetTypingTest(): void {
    this.typingInput.set('');
    this.typingStartedAt.set(0);
    this.typingElapsedMs.set(0);
  }

  protected getOverflowLabel(count: number): string {
    return `+ ${count.toLocaleString()} more`;
  }

  private getInputInsights(): InputInsights {
    const rows = this.inputText().split(/\r?\n/);
    const seen = new Map<string, number>();
    const blankLineRows: number[] = [];
    const whitespaceRows: number[] = [];
    let blankLines = 0;
    let blankLineOverflow = 0;
    let duplicateRows = 0;
    let whitespaceOverflow = 0;
    let whitespaceRowCount = 0;

    rows.forEach((row, index) => {
      const trimmed = row.trim();

      if (!trimmed) {
        if (row.length > 0 || rows.length > 1) {
          blankLines += 1;
          if (blankLineRows.length < MAX_REPORTED_ROW_NUMBERS) {
            blankLineRows.push(index + 1);
          } else {
            blankLineOverflow += 1;
          }
        }
        return;
      }

      if (row !== trimmed) {
        whitespaceRowCount += 1;
        if (whitespaceRows.length < MAX_REPORTED_ROW_NUMBERS) {
          whitespaceRows.push(index + 1);
        } else {
          whitespaceOverflow += 1;
        }
      }

      const previousCount = seen.get(trimmed) ?? 0;
      if (previousCount > 0) {
        duplicateRows += 1;
      }
      seen.set(trimmed, previousCount + 1);
    });

    return {
      blankLines,
      blankLineRows,
      blankLineOverflow,
      duplicateRows,
      whitespaceRows,
      whitespaceOverflow,
      whitespaceRowCount,
    };
  }

  protected saveQuoteOptions(): void {
    const value = `${this.quoteType() === 'single' ? 's' : 'd'}${this.addCommas() ? 1 : 0}${
      this.omitLastComma() ? 1 : 0
    }`;

    document.cookie = `${QUOTE_OPTIONS_COOKIE_NAME}=${value};path=/;max-age=31536000`;
  }

  private readQuoteOptionsCookie(): QuoteOptions | undefined {
    const cookieValue = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith(`${QUOTE_OPTIONS_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (!cookieValue || cookieValue.length !== 3 || !'ds'.includes(cookieValue[0])) {
      return undefined;
    }

    return {
      quoteType: cookieValue[0] === 's' ? 'single' : 'double',
      addCommas: cookieValue[1] === '1',
      omitLastComma: cookieValue[2] === '1',
    };
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3200,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['utility-snackbar'],
    });
  }

  private getVisibleLineNumbers(lineCount: number, scrollTop: number): number[] {
    const totalRows = Math.max(EDITOR_VISIBLE_ROWS, lineCount || 1);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / EDITOR_LINE_HEIGHT) - GUTTER_RENDER_BUFFER,
    );
    const visibleCount = EDITOR_VISIBLE_ROWS + GUTTER_RENDER_BUFFER * 2 + 2;
    const endIndex = Math.min(totalRows, startIndex + visibleCount);

    return Array.from({ length: endIndex - startIndex }, (_, index) => startIndex + index + 1);
  }

  private getGutterOffset(firstLineNumber: number, scrollTop: number): number {
    return EDITOR_VERTICAL_PADDING + (firstLineNumber - 1) * EDITOR_LINE_HEIGHT - scrollTop;
  }

  private getStats(value: string): TextStats {
    if (!value.length) {
      return {
        rows: 0,
        characters: 0,
        words: 0,
      };
    }

    let rows = 1;
    let words = 0;
    let isInWord = false;

    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      const isLineBreak = code === 10 || code === 13;
      const isWhitespace = code <= 32;

      if (isLineBreak) {
        rows += 1;
        if (code === 13 && value.charCodeAt(index + 1) === 10) {
          index += 1;
        }
      }

      if (isWhitespace) {
        isInWord = false;
      } else if (!isInWord) {
        words += 1;
        isInWord = true;
      }
    }

    return {
      rows,
      characters: value.length,
      words,
    };
  }

  private getPasswordPool(categories: PasswordCategory[]): PasswordChar[] {
    return PASSWORD_CHARS.filter(
      (character) =>
        categories.includes(character.category) &&
        (!this.avoidAmbiguous() || !AMBIGUOUS_CHARACTERS.has(character.value)) &&
        (!this.avoidAwkwardKeys() || !AWKWARD_CHARACTERS.has(character.value)),
    );
  }

  private buildStyledPassword(pool: PasswordChar[], categories: PasswordCategory[]): string {
    const disruptionCounts = this.getDisruptionCounts();
    const coreLength = Math.max(
      4,
      this.passwordLength() - disruptionCounts.numbers - disruptionCounts.symbols,
    );
    const coreCategories = this.getCoreCategories(categories);
    const corePool = this.getPasswordPool(coreCategories);
    let core = '';

    if (this.passwordStyle() === 'passphrase' || this.passwordStyle() === 'themed') {
      core = this.buildPassphraseCore(coreLength, categories);
    } else if (this.passwordStyle() === 'smooth') {
      core = this.buildPhoneticPassword(corePool, coreCategories, coreLength);
    } else {
      core = this.buildPassword(corePool.length ? corePool : pool, coreCategories, coreLength);
    }

    return this.insertDisruptions(core, pool, disruptionCounts);
  }

  private buildPassword(
    pool: PasswordChar[],
    categories: PasswordCategory[],
    length = this.passwordLength(),
  ): string {
    const sidePools: Record<PasswordSide, PasswordChar[]> = {
      left: pool.filter((character) => character.side === 'left'),
      right: pool.filter((character) => character.side === 'right'),
    };

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const password = this.alternateHands()
        ? this.buildAlternatingPassword(sidePools, length, pool)
        : Array.from({ length }, () => this.pick(pool).value).join('');

      if (this.includesCategories(password, categories)) {
        return password;
      }
    }

    return this.alternateHands()
      ? this.buildAlternatingPassword(sidePools, length, pool)
      : Array.from({ length }, () => this.pick(pool).value).join('');
  }

  private buildPhoneticPassword(
    pool: PasswordChar[],
    categories: PasswordCategory[],
    length: number,
  ): string {
    const letters = this.buildPhoneticLetters(length);
    const characters = letters.split('');

    if (!this.includeLowercase()) {
      this.applyUppercase(characters, characters.length);
    }
    if (categories.includes('uppercase')) {
      this.applyUppercase(characters);
    }
    if (categories.includes('numbers')) {
      this.applyCategoryReplacement(characters, pool, 'numbers');
    }
    if (categories.includes('symbols')) {
      this.applyCategoryReplacement(characters, pool, 'symbols');
    }

    return characters.join('').slice(0, length);
  }

  private buildPassphraseCore(length: number, categories: PasswordCategory[]): string {
    const preferredWordBank = this.getPassphraseWordBank();
    const wordBank = this.getFreshPassphraseWordBank(preferredWordBank);
    const targetWordCount = this.getPassphraseWordCountForLength(length);
    let bestWords: string[] = [];
    let bestScore = Number.POSITIVE_INFINITY;

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const words = this.buildPassphraseWords(wordBank, targetWordCount, length);
      const formatted = this.formatPassphraseWords(words, categories).join(
        this.getPassphraseSeparator(),
      );
      const score = this.getPassphraseScore(formatted, length);

      if (score < bestScore) {
        bestScore = score;
        bestWords = words;
      }
    }

    this.rememberPassphraseWords(bestWords);

    return this.formatPassphraseWords(bestWords, categories).join(this.getPassphraseSeparator());
  }

  private getPassphraseWordBank(): string[] {
    if (this.passwordStyle() !== 'themed') {
      return this.alternateHands() && ALTERNATING_PASSPHRASE_WORDS.length
        ? ALTERNATING_PASSPHRASE_WORDS
        : PASSPHRASE_WORDS;
    }

    const theme = this.themedPassphraseTheme();
    const themedWords =
      this.alternateHands() && ALTERNATING_THEMED_PASSPHRASE_WORDS[theme].length >= 12
        ? ALTERNATING_THEMED_PASSPHRASE_WORDS[theme]
        : THEMED_PASSPHRASE_WORDS[theme];

    return themedWords.length ? themedWords : PASSPHRASE_WORDS;
  }

  private insertDisruptions(
    core: string,
    pool: PasswordChar[],
    counts: { numbers: number; symbols: number },
  ): string {
    let password = core;
    const numbers = this.pickCharacters(pool, 'numbers', counts.numbers);
    const symbols = this.usesBangSymbolPreset()
      ? Array.from({ length: counts.symbols }, () => '!')
      : this.pickCharacters(pool, 'symbols', counts.symbols);

    password = this.insertDisruptionGroup(password, numbers, this.numberPlacement());
    password = this.insertDisruptionGroup(password, symbols, this.symbolPlacement());

    if (this.numberPlacement() === 'end' && this.symbolPlacement() === 'end') {
      return `${core}${symbols.join('')}${numbers.join('')}`;
    }

    return password;
  }

  private insertDisruptionGroup(
    core: string,
    disruptions: string[],
    placement: DisruptionPlacement,
  ): string {
    if (!disruptions.length) {
      return core;
    }
    if (placement === 'start') {
      return `${disruptions.join('')}${core}`;
    }
    if (placement === 'end') {
      return `${core}${disruptions.join('')}`;
    }
    if (placement === 'random') {
      return this.insertAtIndex(core, disruptions, this.randomNumber(core.length + 1));
    }
    if (placement === 'betweenWords') {
      return this.insertAtIndex(core, disruptions, this.getBetweenWordsInsertIndex(core));
    }

    return core;
  }

  private insertAtIndex(core: string, insertions: string[], index: number): string {
    const characters = core.split('');
    const insertIndex = Math.min(Math.max(index, 0), characters.length);

    characters.splice(insertIndex, 0, ...insertions);

    return characters.join('');
  }

  private getBetweenWordsInsertIndex(core: string): number {
    const separator = this.getPassphraseSeparator();
    const separatorIndexes =
      this.passwordStyle() === 'passphrase' || this.passwordStyle() === 'themed'
        ? this.getSeparatorIndexes(core, separator)
        : [];

    if (separatorIndexes.length) {
      return this.pick(separatorIndexes);
    }

    if (
      (this.passwordStyle() === 'passphrase' || this.passwordStyle() === 'themed') &&
      this.capitalizationStyle() !== 'lowercase'
    ) {
      const wordBoundaryIndexes = core
        .split('')
        .map((character, index) => ({ character, index }))
        .filter(({ character, index }) => index > 0 && /[A-Z]/.test(character))
        .map(({ index }) => index);

      if (wordBoundaryIndexes.length) {
        return this.pick(wordBoundaryIndexes);
      }
    }

    return this.randomNumber(core.length + 1);
  }

  private getSeparatorIndexes(core: string, separator: string): number[] {
    if (!separator) {
      return [];
    }

    const indexes: number[] = [];
    let searchIndex = core.indexOf(separator);

    while (searchIndex >= 0) {
      indexes.push(searchIndex);
      searchIndex = core.indexOf(separator, searchIndex + separator.length);
    }

    return indexes;
  }

  private getDisruptionCounts(): { numbers: number; symbols: number } {
    if (this.endingPattern() === 'bangNumber') {
      return { numbers: this.includeNumbers() ? 1 : 0, symbols: this.includeSymbols() ? 1 : 0 };
    }
    if (this.endingPattern() === 'bangTwoNumbers') {
      return { numbers: this.includeNumbers() ? 2 : 0, symbols: this.includeSymbols() ? 1 : 0 };
    }

    const budget = Math.max(this.passwordLength() - 4, 0);
    const numbers = this.includeNumbers() ? Math.min(this.numberCharacterCount(), budget) : 0;
    const symbols = this.includeSymbols()
      ? Math.min(this.symbolCharacterCount(), Math.max(budget - numbers, 0))
      : 0;

    return { numbers, symbols };
  }

  private usesBangSymbolPreset(): boolean {
    return this.endingPattern() === 'bangNumber' || this.endingPattern() === 'bangTwoNumbers';
  }

  private formatPassphraseWords(words: string[], categories: PasswordCategory[]): string[] {
    if (!categories.includes('uppercase') || this.capitalizationStyle() === 'lowercase') {
      return words;
    }

    if (this.capitalizationStyle() === 'title') {
      return words.map((word) => `${word[0].toUpperCase()}${word.slice(1)}`);
    }

    return words.map((word, index) =>
      index === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`,
    );
  }

  private getPassphraseSeparator(): string {
    if (this.passphraseJoin() === 'hyphen') {
      return '-';
    }
    if (this.passphraseJoin() === 'dot') {
      return '.';
    }
    return '';
  }

  private getFreshPassphraseWordBank(wordBank: string[]): string[] {
    const recent = new Set(this.recentPassphraseWords);
    const freshWords = wordBank.filter((word) => !recent.has(word));

    return freshWords.length >= 24 ? freshWords : wordBank;
  }

  private rememberPassphraseWords(words: string[]): void {
    this.recentPassphraseWords = [...words, ...this.recentPassphraseWords].slice(0, 36);
  }

  private getPassphraseWordCountForLength(length: number): number {
    const separatorLength = this.getPassphraseSeparator().length;
    const maxWords = this.passphraseWordCount();
    let bestCount = 2;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let count = 2; count <= maxWords; count += 1) {
      const averageWordLength = 5;
      const estimatedLength = count * averageWordLength + Math.max(count - 1, 0) * separatorLength;
      const distance = Math.abs(estimatedLength - length);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestCount = count;
      }
    }

    return bestCount;
  }

  private buildPassphraseWords(
    wordBank: string[],
    wordCount: number,
    targetLength: number,
  ): string[] {
    const words: string[] = [];

    while (words.length < wordCount) {
      words.push(this.pickNextPassphraseWord(wordBank, words.at(-1), targetLength, words));
    }

    return words;
  }

  private getPassphraseScore(value: string, targetLength: number): number {
    const lengthPenalty = Math.abs(value.length - targetLength) * 2;
    const rhythmPenalty = this.alternateHands()
      ? getAlternationBreakCount(value) * this.smoothness()
      : 0;

    return lengthPenalty + rhythmPenalty;
  }

  private getCoreCategories(categories: PasswordCategory[]): PasswordCategory[] {
    const coreCategories = categories.filter(
      (category) => category !== 'numbers' && category !== 'symbols',
    );

    if (coreCategories.length) {
      return coreCategories;
    }

    return categories.length ? categories : ['lowercase'];
  }

  private hasLetterCategory(categories: PasswordCategory[]): boolean {
    return categories.includes('lowercase') || categories.includes('uppercase');
  }

  private pickCharacters(
    pool: PasswordChar[],
    category: Extract<PasswordCategory, 'numbers' | 'symbols'>,
    count: number,
  ): string[] {
    const categoryPool = pool.filter((character) => character.category === category);

    if (!categoryPool.length || count <= 0) {
      return [];
    }

    return Array.from({ length: count }, () => this.pick(categoryPool).value);
  }

  private pickNextPassphraseWord(
    wordBank: string[],
    previousWord: string | undefined,
    targetLength: number,
    existingWords: string[],
  ): string {
    const availableWords = wordBank.filter((word) => !existingWords.includes(word));
    const usableWordBank = availableWords.length ? availableWords : wordBank;

    if (!previousWord) {
      return this.pick(usableWordBank);
    }

    const previousSide = getCharacterSide(previousWord.at(-1) ?? '');
    const currentLength = existingWords.join(this.getPassphraseSeparator()).length;
    const candidates = usableWordBank
      .filter((word) => getCharacterSide(word[0]) !== previousSide || this.smoothness() < 60)
      .sort((first, second) => {
        const firstPhrase = [...existingWords, first].join(this.getPassphraseSeparator());
        const secondPhrase = [...existingWords, second].join(this.getPassphraseSeparator());
        const firstLengthScore = Math.abs(currentLength + first.length - targetLength);
        const secondLengthScore = Math.abs(currentLength + second.length - targetLength);

        return (
          this.getPassphraseScore(firstPhrase, targetLength) +
          firstLengthScore -
          (this.getPassphraseScore(secondPhrase, targetLength) + secondLengthScore)
        );
      });

    const bestCandidates = candidates.length ? candidates : wordBank;

    return this.pick(bestCandidates.slice(0, Math.max(4, Math.ceil(bestCandidates.length / 3))));
  }

  private buildPhoneticLetters(length: number): string {
    const characters: string[] = [];
    let side: PasswordSide = this.randomNumber(2) ? 'right' : 'left';
    let wantsConsonant = true;

    while (characters.length < length) {
      const source = wantsConsonant ? PHONETIC_CONSONANTS : PHONETIC_VOWELS;
      const sidePool = source.filter((character) => character.side === side);
      const fallbackPool = source.length ? source : this.getPasswordPool(['lowercase']);
      const pool = sidePool.length ? sidePool : fallbackPool;

      characters.push(this.pick(pool).value);
      wantsConsonant = !wantsConsonant;

      if (this.alternateHands()) {
        side = side === 'left' ? 'right' : 'left';
      } else if (this.randomNumber(3) === 0) {
        side = side === 'left' ? 'right' : 'left';
      }
    }

    return characters.join('');
  }

  private applyUppercase(characters: string[], replacementCount?: number): void {
    const letterIndexes = characters
      .map((character, index) => ({ character, index }))
      .filter(({ character }) => /[a-z]/.test(character))
      .map(({ index }) => index);

    if (!letterIndexes.length) {
      return;
    }

    const replacements = replacementCount ?? Math.max(1, Math.floor(letterIndexes.length / 5));
    if (replacements >= letterIndexes.length) {
      letterIndexes.forEach((index) => {
        characters[index] = characters[index].toUpperCase();
      });
      return;
    }

    for (let count = 0; count < replacements; count += 1) {
      const index = this.pick(letterIndexes);
      characters[index] = characters[index].toUpperCase();
    }
  }

  private applyCategoryReplacement(
    characters: string[],
    pool: PasswordChar[],
    category: Exclude<PasswordCategory, 'lowercase'>,
  ): void {
    const categoryPool = pool.filter((character) => character.category === category);

    if (!categoryPool.length) {
      return;
    }

    const replacements =
      category === 'uppercase' ? Math.max(1, Math.floor(characters.length / 4)) : 1;
    for (let count = 0; count < replacements; count += 1) {
      const index = this.pickReplaceableIndex(characters);
      characters[index] = this.pick(categoryPool).value;
    }
  }

  private pickReplaceableIndex(characters: string[]): number {
    const interiorIndexes = characters
      .map((_, index) => index)
      .filter((index) => index > 0 && index < characters.length - 1);

    return this.pick(
      interiorIndexes.length ? interiorIndexes : characters.map((_, index) => index),
    );
  }

  private buildAlternatingPassword(
    sidePools: Record<PasswordSide, PasswordChar[]>,
    length: number,
    fullPool: PasswordChar[],
  ): string {
    let side: PasswordSide = this.randomNumber(2) ? 'right' : 'left';
    const characters: string[] = [];

    for (let index = 0; index < length; index += 1) {
      const shouldUseRhythm = this.randomNumber(100) < this.smoothness();
      const pool = shouldUseRhythm
        ? sidePools[side].length
          ? sidePools[side]
          : fullPool
        : fullPool;
      characters.push(this.pick(pool).value);
      if (shouldUseRhythm) {
        side = side === 'left' ? 'right' : 'left';
      } else {
        side = this.randomNumber(2) ? 'right' : 'left';
      }
    }

    return characters.join('');
  }

  private includesCategories(password: string, categories: PasswordCategory[]): boolean {
    return categories.every((category) =>
      password
        .split('')
        .some((character) =>
          PASSWORD_CHARS.some((entry) => entry.value === character && entry.category === category),
        ),
    );
  }

  private estimatedEntropy(): number {
    return Math.round(
      this.passwordLength() *
        Math.log2(Math.max(this.getPasswordPool(this.selectedPasswordCategories()).length, 1)),
    );
  }

  private getKeySide(character: string): PasswordSide {
    return getCharacterSide(character);
  }

  private pick<T>(items: T[]): T {
    return items[this.randomNumber(items.length)];
  }

  private randomNumber(maxExclusive: number): number {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % maxExclusive;
  }
}
