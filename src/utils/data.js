const fs = require('fs');

function load_pokemon_db(path) {
  if (!fs.existsSync(path)) global.pokemon_db = JSON.parse('{}');
  else {
    let rawdata = fs.readFileSync(path);
    global.pokemon_db = JSON.parse(rawdata);
  }
}

function load_move_db(path) {
  if (!fs.existsSync(path)) global.move_db = JSON.parse('{}');
  else {
    let rawdata = fs.readFileSync(path);
    global.move_db = JSON.parse(rawdata);
  }
}

/* ======================= Command =======================*/

function insertCommandFromChannel(command, output, channel, isAlias, pg_client) {
  const query = {
    text: 'INSERT INTO command (name,output,channel,isAlias) VALUES ($1, $2, $3, $4)',
    values: [command, output, channel, isAlias],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

function updateCommandOutput(command, channel, output, pg_client) {
  const query = {
    text: 'UPDATE command SET output = $1 WHERE channel = $2 AND LOWER(name) = LOWER($3)',
    values: [output, channel, command],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

function deleteCommandFromChannel(command, channel, pg_client) {
  const query = {
    text: 'DELETE FROM command WHERE channel = $1 AND LOWER(name) = LOWER($2)',
    values: [channel, command],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

/* ======================= Cooldown =======================*/

function insertDefaultCommandWithCooldown(command, cooldown, channel, pg_client) {
  const query = {
    text: 'INSERT INTO command (name,channel,isAlias,cooldown) VALUES ($1, $2, $3, $4)',
    values: [command, channel, false, cooldown],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

function updateCommandWithCooldown(command, cooldown, channel, pg_client) {
  const query = {
    text: 'UPDATE command SET cooldown = $1 WHERE channel = $2 AND LOWER(name) = LOWER($3)',
    values: [cooldown, channel, command],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

/* ======================= Permission =======================*/

function insertDefaultCommandWithPermission(command, permission, channel, pg_client) {
  const query = {
    text: 'INSERT INTO command (name,channel,isAlias,permission) VALUES ($1, $2, $3, $4)',
    values: [command, channel, false, permission],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

function updateCommandWithPermission(command, permission, channel, pg_client) {
  const query = {
    text: 'UPDATE command SET permission = $1 WHERE channel = $2 AND LOWER(name) = LOWER($3)',
    values: [permission, channel, command],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

/* ======================= Game =======================*/

function insertGameCategoryFromChannel(pg_client, game_name, game_abbrv, cat_id, channel) {
  const deletion_query = {
    text: 'DELETE FROM games WHERE channel = $1',
    values: [channel],
  };

  pg_client
    .query(deletion_query)
    .then((res) => {
      const insert_query = {
        text: 'INSERT INTO games (channel,game_name,cat_id,game_abbrv) VALUES ($1, $2, $3, $4)',
        values: [channel, game_name, cat_id, game_abbrv],
      };

      pg_client.query(insert_query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
    })
    .catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

function insertGameCategoryFromChannelWithVar(
  pg_client,
  game_name,
  game_abbrv,
  cat_id,
  var_id,
  var_value,
  channel
) {
  const deletion_query = {
    text: 'DELETE FROM games WHERE channel = $1',
    values: [channel],
  };

  pg_client
    .query(deletion_query)
    .then((res) => {
      const insert_query = {
        text: 'INSERT INTO games (channel,game_name,cat_id,game_abbrv,var_id,var_value) VALUES ($1, $2, $3, $4, $5, $6)',
        values: [channel, game_name, cat_id, game_abbrv, var_id, var_value],
      };

      pg_client.query(insert_query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
    })
    .catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

/* ======================= Runner =======================*/

function insertRunner(runner_name, runner_id, pg_client, channel) {
  const deletion_query = {
    text: 'DELETE FROM runner WHERE channel = $1',
    values: [channel],
  };

  pg_client
    .query(deletion_query)
    .then((res) => {
      const insert_query = {
        text: 'INSERT INTO runner (name, id, channel) VALUES ($1, $2, $3)',
        values: [runner_name, runner_id, channel],
      };

      pg_client.query(insert_query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
    })
    .catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

/* ======================= Counter =======================*/

function insertCounterFromChannel(counter_name, channel, pg_client) {
  const query = {
    text: 'INSERT INTO counter (name, successes, total ,channel) VALUES ($1, $2, $3, $4)',
    values: [counter_name, 0, 0, channel],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

function updateCounter(counter_name, successes, total, channel, pg_client) {
  const query = {
    text: 'UPDATE counter SET successes = $1, total=$2  WHERE channel = $3 AND LOWER(name) = LOWER($4)',
    values: [parseInt(successes), parseInt(total), channel, counter_name],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

function deleteCounterFromChannel(counter_name, channel, pg_client) {
  const query = {
    text: 'DELETE FROM counter WHERE channel = $1 AND LOWER(name) = LOWER($2)',
    values: [channel, counter_name],
  };

  pg_client.query(query).catch((e) => console.error('DATABASE ERROR: ' + e.stack));
}

module.exports = {
  load_move_db,
  load_pokemon_db,
  insertCommandFromChannel,
  updateCommandOutput,
  deleteCommandFromChannel,
  insertDefaultCommandWithPermission,
  updateCommandWithPermission,
  insertGameCategoryFromChannel,
  insertGameCategoryFromChannelWithVar,
  insertRunner,
  insertDefaultCommandWithCooldown,
  updateCommandWithCooldown,
  insertCounterFromChannel,
  updateCounter,
  deleteCounterFromChannel,
};
