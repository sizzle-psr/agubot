const fetch = require('node-fetch');
const { insertGameCategoryFromChannel, insertGameCategoryFromChannelWithVar } = require('../utils/data');

async function async_setgame_handler(game, category, channel, twitch_client, pg_client) {
  const url_game = 'https://www.speedrun.com/api/v1/games?name=' + game;

  // Fetch game data
  const result = await fetch(url_game);
  const res_json = await result.json();

  if (result.status != 200 || res_json.data.length == 0) {
    twitch_client.say(channel, 'Game \"' + game + '\" not found.');
    return;
  }

  const game_abbrv = res_json.data[0].abbreviation;

  const url_categrories = 'https://www.speedrun.com/api/v1/games/' + game_abbrv + '/categories';

  // Fetch Category
  const cat_result = await fetch(url_categrories);

  const cat_res_json = await cat_result.json();

  var cat_id = '';
  for (i = 0; i < cat_res_json.data.length; i++) {
    data = cat_res_json.data[i];
    if (data.name.toLowerCase() === category.toLowerCase()) {
      cat_id = data.id;
      break;
    }
  }

  if (cat_id === '') {
    twitch_client.say(channel, 'Category \"' + category + '\" not found.');
    return;
  }

  // Fetch variable if it exists or was given
  const var_result = await fetch('https://www.speedrun.com/api/v1/categories/' + cat_id + '/variables');
  const var_result_json = await var_result.json();

  if (var_result.status != 200) {
    twitch_client.say(channel, 'Variables not found');
    return;
  }

  // If we got here, we found a game and category
  if (var_result_json.data.length === 0) {
    insertGameCategoryFromChannel(pg_client, game, game_abbrv, cat_id, channel);
  } else {
    var_id_string = '';
    var_value_string = '';
    for (i = 0; i < var_result_json.data.length; i++) {
      var_id_string = var_id_string + ' ' + var_result_json.data[i].id;
      var_value_string = var_value_string + ' ' + var_result_json.data[i].values.default;
    }
    insertGameCategoryFromChannelWithVar(
      pg_client,
      game,
      game_abbrv,
      cat_id,
      var_id_string,
      var_value_string,
      channel
    );
  }
  twitch_client.say(channel, 'Game was set to ' + game + ' ' + category + '.');
}

function setgame_handler(separated_command, channel, twitch_client, pg_client) {
  // !setgame Pokémon Emerald | Any% Glitchless

  // Remove !setgame
  separated_command.shift();

  // Joins string to divide by '|'
  new_string = separated_command.join(' ');
  new_string = new_string.split('|');

  if (new_string.length < 2) {
    twitch_client.say(channel, 'Correct syntax: !setgame <game> | <category> [| <variable>]');
    return;
  } else {
    async_setgame_handler(new_string[0].trim(), new_string[1].trim(), channel, twitch_client, pg_client);
  }

  // https://www.speedrun.com/api/v1/games?name=
}

module.exports = {
  setgame_handler,
};
