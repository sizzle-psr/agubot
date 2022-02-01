const { is_on_cooldown } = require("./complex-cmds/cooldowns");
const {default_commands, default_permission_of_commands } = require("./utils/defaults");
const { command_handler } = require("./handlers/command");
const { permission_handler } = require("./handlers/permission");

const choose = require('./complex-cmds/choose');
const data = require('./complex-cmds/data');
const expr = require('./complex-cmds/expr');
const isredbar = require('./complex-cmds/isredbar');
const metronome = require('./complex-cmds/metronome');
const randmon = require('./complex-cmds/randmon');
const roll = require('./complex-cmds/roll');
const slots = require('./complex-cmds/slots');
const src = require('./complex-cmds/src');
const torrent = require('./complex-cmds/torrent');
const weather = require('./complex-cmds/weather');

function user_has_permission(permission_level, userstate) {
  if (
    (permission_level === 0) || // Any user
    (permission_level <= 1 && "vip" in userstate.badges) || // VIPs
    (permission_level <= 2 && userstate.mod) || // Mod
    ("broadcaster" in userstate.badges) // Streamer
  ) {
    return true;
  }

  return false;
}

function command_is_on_cooldown_for_user(cooldown_time, username, channel_name) {

  return false;
  if (cooldown_time === 0) {
    return false;
  }

  return is_on_cooldown(cooldown_time, username, command_name, channel_name);
}

function default_command_handler(
  separated_command,
  channel_name,
  twitch_client,
  pg_client,
  userstate
) {
  switch (separated_command[0]) {
    case '!command':
      command_handler(separated_command, channel_name, twitch_client, pg_client, false);
      break;
    case '!alias':
      command_handler(separated_command, channel_name, twitch_client, pg_client, true);
      break;
    case '!permission':
      let is_broadcaster = 'broadcaster' in userstate.badges
      permission_handler(separated_command, is_broadcaster, twitch_client, channel_name, pg_client);
      break;
    // case '!cooldown':
    //   cooldown_handler();//TODO
    //   break;
    case '!choose':
      choose.handler(separated_command, twitch_client, channel_name);
      break;
    case '!docs':
      twitch_client.say(channel_name, "https://github.com/sizzle-psr/agubot/blob/multiple-channels/README.md");
      break;
    // case '!data':
      // TODO? Don't know if it's feasible to data multiple channels
      // break;
    case '!expr':
      expr.handler(separated_command, twitch_client, channel_name);
      break;
    case '!isredbar':
      isredbar.handler(separated_command, twitch_client, channel_name);
      break;
    case '!metronome':
      metronome.handler(twitch_client, channel_name);
      break;
    // case '!quote':
      // TODO? Need to see how much DB we use normally
      // break;
    case '!randmon':
      randmon.handler(separated_command, twitch_client, channel_name);
      break;
    // case '!slots': // TODO slots isn't working, twitch changed API
    //   slots.handler(twitch_client, channel_name, userstate.username);
    //   break;
    case '!roll':
      roll.handler(separated_command, twitch_client, channel_name);
      break;
    // case '!src': // Cert problem :(
    //   src.handler(separated_command, twitch_client, channel_name);
    //   break;
    case '!torrent':
      torrent.handler(separated_command, twitch_client, channel_name);
      break;
    case '!weather':
      weather.handler(separated_command, twitch_client, channel_name);
  }
}

async function custom_command_handler(
  command_obj,
  channel_name,
  twitch_client,
  pg_client,
  userstate
) {
  if (command_obj['isalias']) {
    command_parser(command_obj['output'], userstate, twitch_client, channel_name, pg_client);
  } else {
    twitch_client.say(channel_name, command_obj['output']);
  }
}

async function command_parser(
  command_string,
  userstate,
  twitch_client,
  channel_name,
  pg_client
) {

  // Process the command string
  separated_command = command_string.split(" ");

  command_name = separated_command[0].trim();

  // Query Database for possible command info
  const query = {
    text: 'SELECT * FROM command WHERE channel = $1 AND name = $2',
    values: [channel_name, command_name],
  };

  await pg_client
  .query(query)
  .then(res => {
    let username = userstate.username
    if (res.rows.length === 0) {
      // There is no command with this name in the database
      // Maybe it's a default command?
      if (default_commands.indexOf(command_name) != -1) {
        // Check if the user has permission to use this command
        let permission_level = default_permission_of_commands[command_name];
        if (user_has_permission(permission_level, userstate)) {
          // Check if command is on cooldown for user
          if (!command_is_on_cooldown_for_user(command_name, username, channel_name)) {
            default_command_handler(separated_command, channel_name, twitch_client, pg_client, userstate);
          }
        }
      }
    } else {
      // There is a command with this name in the database
      command_obj = res.rows[0];

      // Check if the user has permission to use this command
      if (user_has_permission(command_obj['permission'], userstate)) {
        // User has permission
        // Check if command is on cooldown for user
        if (!command_is_on_cooldown_for_user(command_obj['cooldown'], username, channel_name)) {
          // Command is not on cooldown for user
          if (default_commands.indexOf(command_name) != -1) {
            default_command_handler(separated_command, channel_name, twitch_client, pg_client, userstate);
          } else {
            custom_command_handler(command_obj, channel_name, twitch_client, pg_client, userstate); // TODO
          }
        }
      }
    }
  })
  .catch(e => {
    console.log("Could not fetch command/alias.");
    console.error(e.stack);
    twitch_client.say(channel_name, "Error. Please contact the bot maintainer");
  });
}

module.exports = {
  command_parser
};
