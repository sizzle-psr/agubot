var runner_list = [
  'Amoeba UK',
  'Exari onU',
  'wer ster',
  'shiru 666',
  'Kukk erTM',
  'Siz zle',
  'poke guy',
  'Gunner maniac',
  'Swift alu',
  'sco agogo',
  'Mach Wing',
  'KidRo cker96',
  'Driek iann',
  'edda ket',
  'Wh0mis DS',
  'Casual pokePlayer',
  'Ender born',
  'JP Xinnam',
  'kur ddt',
  'SL weed',
  'Van dio',
  '3rd Jester',
  'slayer lol',
  '5upa mayne',
  'abys mal',
  'Ana nan',
  'cater knees',
  'thewaffle man',
  'wave warrior',
  'dec sy',
  'Extra Tricky',
  'Dabom stew',
  'Keiz aron',
  'gif vex',
  'entr pntr',
  'string flow',
  'New Amber',
  'G Shark54',
  'Is rar',
  'Jord an97',
  'lucky typhlosion',
  'Mad diicT',
  'Ranger Squid',
  'Sparkle Lanturn',
  '_ PoY',
  'wink market',
  'Æ tienne',
  'thunder _147_',
  'Ti Kevin83',
  'randall eatscheese',
  'ringo 777',
  'mindof damon',
  'que laagging',
  'Vin cento',
  'Sin star',
  'Affected Ashes',
  'Pulse Effects',
  'Juanly ways',
  'Retro tato',
  'lime washere',
  'Head bob',
  'Corvi mae',
  'Thomas PatrickWX',
  'Bungied 2TheTree',
  'Garfield TheLightning',
  'head strong',
  'San Jan',
  'Ti ppi',
  'Et chy',
  'fran chewbacca',
  'knox conary',
  'JT MagicMan',
  'Sheltie sci',
  'iron dre_',
  'cooltrainer michael',
  'tru ely',
  'pickle plop',
  'Q palz',
  'zen aga',
  'luck less',
  'lovesick hero',
  'bang Yongguk',
  'AnaI Pikachu',
  'Primal Pizza',
  'hwang bro',
  'Yuji ito',
  'Der Teppich',
  'em ray',
  'SquareRoot ofSheep',
  'stoc chi',
  'Teh HammerShow',
  'GoodAt BeingSimple',
  'Econ Sean',
  'I_only_say VoHiYo',
  'Legend Eater',
  'callum bal',
  'Alan Schweitzer',
  'Fract NL',
  'Ocean Bagel',
  'doctor sprinkles',
  'Main 97',
  'themath genius',
  'ryzi ken',
  'Rau flegon',
  'min now',
  'Chub Fish',
  'Boun xii',
  'Ruben tus',
  'Saiyan Cinq',
  'The KRAM',
  'Buster Poke',
  'Money HypeMike',
  'hal qery',
  'The4th GenGamer',
  'Ekman Larsson',
  'ito taka',
  'Oh Snap',
  'ker bis54',
  'jy ash4',
  'aka saka',
  'Ed HeadSR',
  'puny uta',
  'Tucker LeRat',
  'Gimmy Thomas',
]; // Credit to AmoebaUK and Scoagogo for compiling and providing this list

function handler(twitch_client, channel_name) {
  let start =
    runner_list[Math.floor(Math.random() * runner_list.length)].split(' ')[
      Math.floor(Math.random() * 2)
    ];
  let end =
    runner_list[Math.floor(Math.random() * runner_list.length)].split(' ')[
      Math.floor(Math.random() * 2)
    ];

  twitch_client.say(channel_name, start + end);
  return;
}

module.exports = { handler };
