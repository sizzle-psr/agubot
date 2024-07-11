const letsgoData = require('../../data/letsgoData.json');

const regex = /^!catchrate (?<pokemon>[^\s]+)( (?<level>\d{1,2}))? (?<balls>(P|G|U){1,2})( (?<berry>R|SR|GR))?( (?<technique>N|G|E))?$/i;

const ballModifiers = {
  "P": 1.0,
  "G": 1.5,
  "U": 2.0
}

const berryModifiers = {
  "R": 1.5,
  "SR": 2.25,
  "GR": 4.0
}

const techniqueModifiers = {
  "N": 1.5,
  "G": 2.0,
  "E": 2.5
}

const DEFAULT_IV = 15;

// Calculates the catch rate for a pokemon in Let's Go. This is based on this spreadsheet: https://docs.google.com/spreadsheets/d/1ETa7mH0ygBAViFgs28YLpFzr_Op_RxoDhIy6h8123AE
function handler(command_string, client, channel_name) {
  try {
    let { groups: { pokemon, level, balls, berry, technique } } = regex.exec(command_string);
    balls = balls?.toUpperCase();
    berry = berry?.toUpperCase();
    technique = technique?.toUpperCase();
    const pokemonInfo = letsgoData.pokemon[pokemon.toLowerCase()];

    if (pokemonInfo) {
      const speciesCatchRate = pokemonInfo.catchRate;
      const actualLevel = level ? parseInt(level) : pokemonInfo.defaultLevel;

      const ball1 = balls.charAt(0);
      const ball2 = (balls.length == 2) ? balls.charAt(1) : "None";

      const ball1Mod = getBallMod(ball1);
      const ball2Mod = getBallMod(ball2);

      const noPlayers = (ball2Mod > 0) ? 2 : 1;

      const techMod = getTechMod(technique);
      const berryMod = getBerryMod(berry);

      const friendshipMultiplier = (pokemonInfo.friendship / 255 / 10 + 1) * 100;

      const hpStat = Math.floor((DEFAULT_IV + (2 * pokemonInfo.baseStats.hp)) * actualLevel / 100);
      const attackStat = Math.floor((DEFAULT_IV + (2 * pokemonInfo.baseStats.attack)) * actualLevel / 100) + 5;
      const defenseStat = Math.floor((DEFAULT_IV + (2 * pokemonInfo.baseStats.defense)) * actualLevel / 100) + 5;
      const spattackStat = Math.floor((DEFAULT_IV + (2 * pokemonInfo.baseStats.spattack)) * actualLevel / 100) + 5;
      const spdefenseStat = Math.floor((DEFAULT_IV + (2 * pokemonInfo.baseStats.spdefense)) * actualLevel / 100) + 5;
      const speedStat = Math.floor((DEFAULT_IV + (2 * pokemonInfo.baseStats.speed)) * actualLevel / 100) + 5;

      const hp = Math.floor(hpStat + 10 + actualLevel);
      const attack = Math.floor(friendshipMultiplier * attackStat / 100);
      const defense = Math.floor(friendshipMultiplier * defenseStat / 100);
      const spattack = Math.floor(friendshipMultiplier * spattackStat / 100);
      const spdefense = Math.floor(friendshipMultiplier * spdefenseStat / 100);
      const speed = Math.floor(friendshipMultiplier * speedStat / 100);

      const statSum = hp + attack + defense + spattack + spdefense + speed;

      const cp = Math.floor(statSum * 6 * actualLevel * 0.01);

      const a = Math.pow(10000/(cp + 1), 0.25);
      const b = noPlayers * a * Math.pow((ball1Mod + ball2Mod)/noPlayers, 1.5);
      const c = Math.sqrt(techMod * berryMod);

      const mcr = (Math.pow(speciesCatchRate,1/1.85) * b * c) * 1.25;
      const shakeChance = Math.trunc(65535/Math.max(Math.pow(255.0/mcr,1.0/5.33),1));
      const shakeSuccess = shakeChance / 65536;

      const catchrate = Math.pow(shakeSuccess, 4)*100;

      client.say(channel_name, `${pokemon} lvl${actualLevel} ${balls.toUpperCase()}${berry ? " " + berry.toUpperCase() : ""}${technique ? " " + technique.toUpperCase() : ""}: ${catchrate.toFixed(2)}%`);
    } else {
      client.say(channel_name, `${pokemon} is not a catchable Pokémon`);
    }
  } catch (_error) {
    client.say(channel_name, "Syntax: !catchrate <pokemon> [<level>] <balls> [<berry>] [<technique>]");
  }
}

function getBallMod(ball) {
  const ballMod = ballModifiers[ball];

  return ballMod ? ballMod : 0.0;
}

function getBerryMod(berry) {
  const berryMod = berryModifiers[berry];

  return berryMod ? berryMod : 1.0;
}


function getTechMod(technique) {
  const techMod = techniqueModifiers[technique];

  return techMod ? techMod : 1.0;
}

module.exports = { handler };
