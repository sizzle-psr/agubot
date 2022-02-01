const default_commands = [
  '!command',
  '!alias',
  '!permission',
  // '!cooldown',
  '!choose',
  // '!data', (prob not fixing)
  '!docs',
  '!expr',
  '!isredbar',
  '!metronome',
  // '!pb', -> TODO
  // '!quote', (needs evaluation of db)
  '!randmon',
  '!roll',
  // '!setgame', -> TODO
  // '!setrunner', -> TODO
  // '!slots', -> TODO
  // '!src', -> TODO
  '!torrent',
  '!weather',
  // '!wr', -> TODO
];

const default_permission_of_commands = {
  '!command': 2,
  '!alias': 2,
  '!permission': 2,
  // '!cooldown': 2,
  '!choose': 0,
  // '!data': 0,
  '!docs': 0,
  '!expr': 1, // avoid misusage, can be dowgraded
  '!isredbar': 0,
  '!metronome': 0,
  // '!pb': 0,
  // '!quote': 0,
  '!randmon': 0,
  '!roll': 0,
  // '!setgame': 2,
  // '!setrunner': 2,
  // '!slots': 0,
  // '!src': 0,
  '!torrent': 0,
  '!weather': 2,
  // '!wr': 0,
}

const default_cooldown_of_commands = {
  '!command': 0,
  '!alias': 0,
  '!permission': 0,
  // '!cooldown': 0,
  '!choose': 0,
  // '!data': 0,
  '!docs': 0,
  '!expr': 15, // avoid misusage, can be lowered
  '!isredbar': 0,
  '!metronome': 0,
  // '!pb': 0,
  // '!quote': 0,
  '!randmon': 0,
  '!roll': 0,
  // '!setgame': 0,
  // '!setrunner': 0,
  // '!slots': 600,
  // '!src': 10,
  '!torrent': 0,
  '!weather': 10,
  // '!wr': 0,
}

const non_permission_downgrade = [
  '!command',
  '!alias',
  '!permission',
  '!cooldown',
  '!weather'
];

const non_aliasable = [
  '!command',
  '!alias',
  '!permission',
  '!cooldown',
  '!weather',
  '!slots',
  '!expr',
  '!quote',
];

module.exports = {
  default_commands,
  non_permission_downgrade,
  non_aliasable,
  default_permission_of_commands,
  default_cooldown_of_commands
};
