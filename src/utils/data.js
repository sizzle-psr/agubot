const fs = require("fs");

function load_pokemon_db(path) {
  if (!fs.existsSync(path)) global.pokemon_db = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path);
    global.pokemon_db = JSON.parse(rawdata);
  }
}

function load_move_db(path) {
  if (!fs.existsSync(path)) global.move_db = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path);
    global.move_db = JSON.parse(rawdata);
  }
}

function insertCommandFromChannel(
  command,
  output,
  channel,
  isAlias,
  pg_client,
) {
  const query = {
    text: "INSERT INTO command (name,output,channel,isAlias) VALUES ($1, $2, $3, $4)",
    values: [command, output, channel, isAlias],
  };

  pg_client
    .query(query)
    .then((res) => console.log("Inserted: " + res))
    .catch((e) => console.error("DATABASE ERROR: " + e.stack));
}

function updateCommandOutput(command, channel, output, pg_client) {
  const query = {
    text: "UPDATE command SET output = $1 WHERE channel = $2 AND name = $3",
    values: [output, channel, command],
  };

  pg_client
    .query(query)
    .then((res) => console.log("Updated: " + res))
    .catch((e) => console.error("DATABASE ERROR: " + e.stack));
}

function deleteCommandFromChannel(command, channel, pg_client) {
  const query = {
    text: "DELETE FROM command WHERE channel = $1 AND name = $2",
    values: [channel, command],
  };

  pg_client
    .query(query)
    .then((res) => console.log("Deleted: " + res))
    .catch((e) => console.error("DATABASE ERROR: " + e.stack));
}

function insertDefaultCommandWithCooldown(
  command,
  cooldown,
  channel,
  pg_client) {
  const query = {
    text: "INSERT INTO command (name,channel,isAlias,cooldown) VALUES ($1, $2, $3, $4)",
    values: [command, channel, false, cooldown],
  };

  pg_client
    .query(query)
    .then((res) => console.log("Inserted: " + res))
    .catch((e) => console.error("DATABASE ERROR: " + e.stack));
}

function updateCommandWithCooldown(
  command,
  cooldown,
  channel,
  pg_client
) {
  const query = {
    text: "UPDATE command SET cooldown = $1 WHERE channel = $2 AND name = $3",
    values: [cooldown, channel, command],
  };

  pg_client
    .query(query)
    .then((res) => console.log("Updated: " + res))
    .catch((e) => console.error("DATABASE ERROR: " + e.stack))
}

function insertDefaultCommandWithPermission(
  command,
  permission,
  channel,
  pg_client) {
  const query = {
    text: "INSERT INTO command (name,channel,isAlias,permission) VALUES ($1, $2, $3, $4)",
    values: [command, channel, false, permission],
  };

  pg_client
    .query(query)
    .then((res) => console.log("Inserted: " + res))
    .catch((e) => console.error("DATABASE ERROR: " + e.stack));
}

function updateCommandWithPermission(
  command,
  permission,
  channel,
  pg_client
) {
  const query = {
    text: "UPDATE command SET permission = $1 WHERE channel = $2 AND name = $3",
    values: [permission, channel, command],
  };

  pg_client
    .query(query)
    .then((res) => console.log("Updated: " + res))
    .catch((e) => console.error("DATABASE ERROR: " + e.stack))
}

module.exports = {
  load_move_db,
  load_pokemon_db,
  insertCommandFromChannel,
  updateCommandOutput,
  deleteCommandFromChannel,
  insertDefaultCommandWithPermission,
  updateCommandWithPermission,
};
