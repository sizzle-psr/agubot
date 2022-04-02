// const { is_on_cooldown } = require('./complex-cmds/cooldowns');
const {
  default_commands,
  default_permission_of_commands,
  default_cooldown_of_commands,
} = require("./utils/defaults");
const { command_handler } = require("./handlers/command");
const { setgame_handler } = require("./handlers/setgame");
const { setrunner_handler } = require("./handlers/setrunner");
const { permission_handler } = require("./handlers/permission");
const { cooldown_handler } = require("./handlers/cooldown");
const { counter_handler, update_counter } = require("./handlers/counter");

const _229 = require("./complex-cmds/229");
const choose = require("./complex-cmds/choose");
// const data = require('./complex-cmds/data');
const expr = require("./complex-cmds/expr");
const isredbar = require("./complex-cmds/isredbar");
const metronome = require("./complex-cmds/metronome");
const pb = require("./complex-cmds/pb");
const pinballslots = require("./complex-cmds/pinballslots");
const randmon = require("./complex-cmds/randmon");
const randrunner = require("./complex-cmds/randrunner");
const randstats = require("./complex-cmds/randstats");
const roll = require("./complex-cmds/roll");
const slots = require("./complex-cmds/slots");
// const src = require('./complex-cmds/src');
const torrent = require("./complex-cmds/torrent");
const weather = require("./complex-cmds/weather");
const wr = require("./complex-cmds/wr");
const { defaults } = require("pg/lib");

// This has format:
// {
//   '!command': {
//     'username': Date Object
//   },
//  '!command2': {
//     'username': Date Object,
//     'username1': Date Object
//   }
// }
last_usage_of_user_per_command = {};

function user_has_permission(permission_level, userstate) {
  if (
    (userstate == null || userstate.badges == null) &&
    permission_level != 0
  ) {
    return false;
  }

  if (
    permission_level === 0 || // Any user
    (permission_level <= 1 && "vip" in userstate.badges) || // VIPs
    (permission_level <= 2 && userstate.mod) || // Mod
    "broadcaster" in userstate.badges // Streamer
  ) {
    return true;
  }

  return false;
}

function command_is_on_cooldown_for_user(
  command_name,
  cooldown_time,
  username,
  channel_name
) {
  if (command_name in last_usage_of_user_per_command) {
    if (username in last_usage_of_user_per_command[command_name]) {
      let now = new Date();
      const last_usage = last_usage_of_user_per_command[command_name][username];
      const diff_time = Math.ceil(Math.abs(last_usage - now) / 1000);
      if (diff_time >= cooldown_time) {
        last_usage_of_user_per_command[command_name][username] = new Date();
      }
      return diff_time < cooldown_time;
    } else {
      last_usage_of_user_per_command[command_name][username] = new Date();
      return false;
    }
  } else {
    last_usage_of_user_per_command[command_name] = {};
    last_usage_of_user_per_command[command_name][username] = new Date();
    return false;
  }
}

function default_command_handler(
  separated_command,
  channel_name,
  twitch_client,
  pg_client,
  userstate
) {
  switch (separated_command[0]) {
    case "!229":
      _229.handler(twitch_client, channel_name);
      break;
    case "!command":
      command_handler(
        separated_command,
        channel_name,
        twitch_client,
        pg_client,
        false
      );
      break;
    case "!alias":
      command_handler(
        separated_command,
        channel_name,
        twitch_client,
        pg_client,
        true
      );
      break;
    case "!permission":
      let is_broadcaster = "broadcaster" in userstate.badges;
      permission_handler(
        separated_command,
        is_broadcaster,
        twitch_client,
        channel_name,
        pg_client
      );
      break;
    case "!cooldown":
      cooldown_handler(
        separated_command,
        twitch_client,
        channel_name,
        pg_client
      );
      break;
    case "!counter":
      counter_handler(
        separated_command,
        channel_name,
        twitch_client,
        pg_client
      );
      break;
    case "!choose":
      choose.handler(separated_command, twitch_client, channel_name);
      break;
    case "!docs":
      twitch_client.say(
        channel_name,
        "https://github.com/sizzle-psr/agubot/blob/multiple-channels/README.md"
      );
      break;
    // case '!data':
    // TODO? Don't know if it's feasible to data multiple channels
    // break;
    case "!expr":
      expr.handler(separated_command, twitch_client, channel_name);
      break;
    case "!isredbar":
      isredbar.handler(separated_command, twitch_client, channel_name);
      break;
    case "!metronome":
      metronome.handler(twitch_client, channel_name);
      break;
    case "!pb":
      pb.handler(channel_name, twitch_client, pg_client);
      break;
    case "!pinballslots":
      pinballslots.handler(twitch_client, channel_name, userstate.username);
      break;
    // case '!quote':
    // TODO? Need to see how much DB we use normally
    // break;
    case "!randmon":
      randmon.handler(separated_command, twitch_client, channel_name);
      break;
    case "!randrunner":
      randrunner.handler(twitch_client, channel_name);
      break;
    case "!randstats":
      randstats.handler(twitch_client, channel_name);
      break;
    case "!setgame":
      setgame_handler(
        separated_command,
        channel_name,
        twitch_client,
        pg_client
      );
      break;
    case "!setrunner":
      setrunner_handler(
        separated_command,
        channel_name,
        twitch_client,
        pg_client
      );
      break;
    case "!slots":
      slots.handler(twitch_client, channel_name, userstate.username);
      break;
    case "!roll":
      roll.handler(separated_command, twitch_client, channel_name);
      break;
    // case '!src': // Cert problem :(
    //   src.handler(separated_command, twitch_client, channel_name);
    //   break;
    case "!torrent":
      torrent.handler(separated_command, twitch_client, channel_name);
      break;
    case "!weather":
      weather.handler(separated_command, twitch_client, channel_name);
      break;
    case "!wr":
      wr.handler(channel_name, twitch_client, pg_client);
      break;
  }
}

async function custom_command_handler(
  command_obj,
  channel_name,
  twitch_client,
  pg_client,
  userstate
) {
  if (command_obj["isalias"]) {
    command_parser(
      command_obj["output"],
      userstate,
      twitch_client,
      channel_name,
      pg_client
    );
  } else {
    twitch_client.say(channel_name, command_obj["output"]);
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

  if (command_name.startsWith("-")) {
    let is_mod = user_has_permission(2, userstate);
    if (is_mod || separated_command.length == 1) {
      // Counter is always mod or above, unless to check
      update_counter(
        separated_command,
        channel_name,
        twitch_client,
        pg_client,
        is_mod
      );
    }
    return;
  }

  // Query Database for possible command info
  const query = {
    text: "SELECT * FROM command WHERE channel = $1 AND LOWER(name) = LOWER($2)",
    values: [channel_name, command_name],
  };

  await pg_client
    .query(query)
    .then((res) => {
      let username = userstate.username;
      if (res.rows.length === 0) {
        // There is no command with this name in the database
        // Maybe it's a default command?
        if (default_commands.indexOf(command_name) != -1) {
          // Check if the user has permission to use this command
          let permission_level = default_permission_of_commands[command_name];
          if (user_has_permission(permission_level, userstate)) {
            // Check if command is on cooldown for user
            if (
              !command_is_on_cooldown_for_user(
                command_name,
                default_cooldown_of_commands[command_name],
                username,
                channel_name
              )
            ) {
              default_command_handler(
                separated_command,
                channel_name,
                twitch_client,
                pg_client,
                userstate
              );
            }
          }
        }
      } else {
        // There is a command with this name in the database
        command_obj = res.rows[0];

        // Check if the user has permission to use this command
        if (user_has_permission(command_obj["permission"], userstate)) {
          // User has permission
          var cooldown;
          if (command_obj["cooldown"] != 0) {
            cooldown = command_obj["cooldown"];
          } else {
            cooldown =
              command_name in default_cooldown_of_commands != -1
                ? default_cooldown_of_commands[command_name]
                : 0;
          }

          // Check if command is on cooldown for user
          if (
            !command_is_on_cooldown_for_user(
              command_name,
              cooldown,
              username,
              channel_name
            )
          ) {
            // Command is not on cooldown for user
            if (default_commands.indexOf(command_name) != -1) {
              default_command_handler(
                separated_command,
                channel_name,
                twitch_client,
                pg_client,
                userstate
              );
            } else {
              custom_command_handler(
                command_obj,
                channel_name,
                twitch_client,
                pg_client,
                userstate
              ); // TODO
            }
          }
        }
      }
    })
    .catch((e) => {
      console.log("Could not fetch command/alias.");
      console.error(e.stack);
      twitch_client.say(
        channel_name,
        "Error. Please contact the bot maintainer"
      );
    });
}

module.exports = {
  command_parser,
};
