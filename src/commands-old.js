const fs = require("fs");
const data = require("./complex-cmds/data");
const choose = require("./complex-cmds/choose");
const randmon = require("./complex-cmds/randmon");
const metronome = require("./complex-cmds/metronome");
const src = require("./complex-cmds/src");
const torrent = require("./complex-cmds/torrent");
const isredbar = require("./complex-cmds/isredbar");
const roll = require("./complex-cmds/roll");
const expr = require("./complex-cmds/expr");
const quote = require("./complex-cmds/quote");
const slots = require("./complex-cmds/slots");
const weather = require("./complex-cmds/weather");
const cooldown = require("./complex-cmds/cooldowns");
const ret_codes = require("./utils/retcodes");
const database_utils = require("./utils/data");

var command_dict;
var alias_dict;
var permission_dict;

const default_commands = [
  "!command",
  "!alias",
  "!permission",
  "!cooldown",
  "!randmon",
  "!metronome",
  "!src",
  "!slots",
  "!weather",
  "!roll",
  "!quote",
  "!expr",
  "!data",
  "!choose",
  "!isredbar",
  "!torrent"
]

const non_alias_commands = [
  "!command",
  "!alias",
  "!permission",
  "!cooldown",
  "!randmon",
  "!slots",
  "!expr",
  "!data",
  "!metronome",
]

async function async_command_handler(client, separated, pg_client, channel, isAlias) {
  const query = {
    text: 'SELECT * FROM command WHERE channel = $1 AND name = $2',
    values: [channel, separated[2]],
  };

  await pg_client
  .query(query)
  .then(res => {
    // Successful fetch
    if (separated[1] === "add") {
      if (res.rows.length === 0) {
        // Process string
        separated.shift(); //removes '!command'
        separated.shift(); //removes 'add'
        let command_name = separated[0];
        separated.shift(); //removes the command name

        // Upload to db
        database_utils.insertCommandFromChannel(
          command_name,
          separated.join(" "),
          channel,
          isAlias,
          pg_client
        );
        if (!isAlias) {
          client.say(channel, "Command " + command_name + " was added");
        } else {
          client.say(channel, "Alias " + command_name + " was added");
        }
      } else {
        if (!isAlias) {
          client.say(channel, "Command " + command_name + " already exists");
        } else {
          client.say(channel, "Alias " + command_name + " already exists");
        }
      }
    } else if (separated[1] === "edit") {
      if (res.rows.length === 1) {
        // Process string
        separated.shift(); //removes '!command'
        separated.shift(); //removes 'edit'
        let command_name = separated[0];
        separated.shift(); //removes the command name

        // Upload to db
        database_utils.updateCommandOutput(command_name, channel, separated.join(" "), pg_client);

        if (!isAlias) {
          client.say(channel, "Command " + command_name + " was updated");
        } else {
          client.say(channel, "Alias " + command_name + " was updated");
        }
      } else {
        if (!isAlias) {
          client.say(channel, "Command " + command_name + " does not exist");
        } else {
          client.say(channel, "Alias " + command_name + " does not exist");
        }
      }
    } else { // Must be delete
      if (res.rows.length === 1) {
        
        let command_name = separated[2];
        // Upload to db
        database_utils.deleteCommandFromChannel(command_name, channel, pg_client);

        if (!isAlias) {
          client.say(channel, "Command " + command_name + " was deleted");
        } else {
          client.say(channel, "Alias " + command_name + " was deleted");
        }
      } else {
        if (!isAlias) {
          client.say(channel, "Command " + command_name + " does not exist");
        } else {
          client.say(channel, "Alias " + command_name + " does not exist");
        }
      }
    }
  })
  .catch(e => {
    console.log("Could not fetch command/alias.");
    console.error(e.stack);
    client.say(channel, "Error. Please contact the bot maintainer");
  });
}

function command_handler(client, separated, pg_client, channel, isAlias) {
  separated[1] = separated[1].toLowerCase();
  separated[2] = separated[2].toLowerCase();

  if (separated[1] === "add" ||
      separated[1] === "edit" ||
      separated[1] === "delete") {

    async_command_handler(client, separated, pg_client, channel, isAlias);
    ret = [ret_codes.RetCodes.OK, ""];
  } else {
    if (!isAlias) {
      ret = [
        ret_codes.RetCodes.ERROR,
        "Correct syntax: !command <operation> <name> [command]",
      ];
    } else {
      ret = [
        ret_codes.RetCodes.ERROR,
        "Correct syntax: !alias <operation> <name> [command]",
      ];
    }
  }

  return ret;
}

async function async_output_handler(client, channel, pg_client, command, userstate) {
  const query = {
    text: 'SELECT * FROM command WHERE channel = $1 AND name = $2',
    values: [channel, command],
  };

  await pg_client
  .query(query)
  .then(res => {
    if (res.rows.length === 1) {
      output_obj = res.rows[0];

      if (!output_obj['isalias']) {
        client.say(channel, output_obj['output']);
      } else {
        command_parser(output_obj['output'], userstate, client, channel, pg_client, true);
      }
    }
  })
  .catch(e => {
    console.log("Could not fetch command/alias.");
    console.error(e.stack);
    client.say(channel, "Error. Please contact the bot maintainer");
  });
}

function command_parser(
  command,
  userstate /*Can be undefined*/,
  client,
  target,
  pg_client,
  isAsyncCall = false
) {
  var reply;
  var separated = command.trim().split(" ");
  separated[0] = separated[0].toLowerCase();

  switch (separated[0]) {
    case "!command":
      if (
        userstate &&
        (userstate.mod ||
          (userstate.badges && "broadcaster" in userstate.badges)) &&
        !(separated[2] in default_commands)
      )
        reply = command_handler(client, separated, pg_client, target, false);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!alias":
      if (
        userstate &&
        (userstate.mod ||
          (userstate.badges && "broadcaster" in userstate.badges)) &&
        !(separated[2] in non_alias_commands)
      )
        reply = command_handler(client, separated, pg_client, target, true);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    // case "!permission":
    //   if (
    //     userstate &&
    //     (userstate.mod ||
    //       (userstate.badges && "broadcaster" in userstate.badges)) &&
    //     !(separated[2] in complex_cmds)
    //   )
    //     reply = permission_handler(separated);
    //   else reply = [ret_codes.RetCodes.ERROR, ""];
    //   break;

    // case "!data":
    //   reply = data.handler();
    //   break;

    case "!choose":
      reply = choose.handler(separated);
      break;

    case "!randmon":
      if (!cooldown.is_on_cooldown(userstate.username, "!randmon")) {
        reply = randmon.handler(separated);
      } else {
        reply = [ret_codes.RetCodes.ERROR, ""];
      }
      break;

    case "!metronome":
      if (!cooldown.is_on_cooldown(userstate.username, "!metronome")) {
        reply = metronome.handler();
      } else {
        reply = [ret_codes.RetCodes.ERROR, ""];
      }
      break;

    // case "!src":
    //   if (!cooldown.is_on_cooldown(userstate.username, "!src")) {
    //     reply = src.handler(separated, client, target);
    //   } else {
    //     reply = [ret_codes.RetCodes.ERROR, ""];
    //   }
    //   break;

    case "!torrent":
      reply = torrent.handler(separated);
      break;

    case "!isredbar":
      reply = isredbar.handler(separated, client, target);
      break;

    case "!roll":
      reply = roll.handler(separated);
      break;

    case "!expr":
      reply = expr.handler(separated);
      break;

    // case "!slots":
    //   if (!cooldown.is_on_cooldown(userstate.username, "!slots")) {
    //     reply = slots.handler(client, target, userstate.username);
    //   } else {
    //     reply = [ret_codes.RetCodes.ERROR, ""];
    //   }
    //   break;

    case "!weather":
      if (
        userstate &&
        (userstate.mod ||
          (userstate.badges && "broadcaster" in userstate.badges)) &&
        process.env.WEATHER_API_KEY &&
        !cooldown.is_on_cooldown(userstate.username, "!weather")
      )
        reply = weather.handler(separated, client, target);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    // case "!quote":
    //   if (!cooldown.is_on_cooldown(userstate.username, "!quote"))
    //     reply = quote.handler(separated, userstate);
    //   else reply = [ret_codes.RetCodes.ERROR, ""];
    //   break;

    // case "!cooldown":
    //   if (
    //     userstate &&
    //     (userstate.mod ||
    //       (userstate.badges && "broadcaster" in userstate.badges)) &&
    //     (complex_cmds.includes(separated[2]) ||
    //       separated[2] in command_dict ||
    //       separated[2] in alias_dict)
    //   ) {
    //     reply = cooldown.handler(separated);
    //   } else {
    //     reply = [
    //       ret_codes.ERROR,
    //       "You cannot add a cooldown to " + separated[2] + ".",
    //     ];
    //   }
    //   break;

    default:
      if (separated[0].startsWith("!")) {
        async_output_handler(client, target, pg_client, separated[0], userstate);
      }
      reply = [ret_codes.RetCodes.OK, ""];
      break;
  }

  // The aliases need to be said even when there isn't a thread to pick up the return
  if (isAsyncCall) {
    if (reply[0] !== ret_codes.RetCodes.NOT_FOUND && reply[1] !== "") {
      client.say(target, reply[1]);
    }
  }
  return reply;
}

module.exports = {
  command_parser,
};
