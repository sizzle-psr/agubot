const fs = require("fs");
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
const ret_codes = require("./utils/retcodes");
const { sep } = require("path");

var command_dict;
var alias_dict;
var permission_dict;

function load_command_db(path) {
  if (!fs.existsSync(path)) command_dict = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path);
    command_dict = JSON.parse(rawdata);
  }
}

function load_alias_db(path) {
  if (!fs.existsSync(path)) alias_dict = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path);
    alias_dict = JSON.parse(rawdata);
  }
}

function load_permission_db(path) {
  if (!fs.existsSync(path)) permission_dict = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path);
    permission_dict = JSON.parse(rawdata);
  }
}

function update_commmand_db() {
  fs.writeFileSync(process.env.COMMAND_DB_PATH, JSON.stringify(command_dict));
}

function update_alias_db() {
  fs.writeFileSync(process.env.ALIAS_DB_PATH, JSON.stringify(alias_dict));
}

function update_permission_db() {
  fs.writeFileSync(
    process.env.PERMISSION_DB_PATH,
    JSON.stringify(permission_dict)
  );
}

function command_handler(separated) {
  if (separated.length < 5)
    return [
      ret_codes.RetCodes.ERROR,
      "Correct syntax: !command <operation> <name> [command]",
    ];

  separated[1] = separated[1].toLowerCase();
  separated[2] = separated[2].toLowerCase();

  if (separated[1] === "add") {
    if (separated[2] in command_dict) {
      // The command exists
      return [
        ret_codes.RetCodes.ERROR,
        "Command " + separated[2] + " already exists.",
      ];
    }

    if (separated[2] in alias_dict) {
      // The command exists as an alias
      return [
        ret_codes.RetCodes.ERROR,
        "Command " + separated[2] + " already exists as an alias.",
      ];
    }

    separated.shift(); //removes '!command'
    separated.shift(); //removes 'add'
    let command_name = separated[0];
    separated.shift(); //removes the command name
    command_dict[command_name] = separated.join(" ");
    update_commmand_db();
    ret = [
      ret_codes.RetCodes.CREATED,
      "Command " + command_name + " was added.",
    ];
  } else if (separated[1] === "edit") {
    if (separated[2] in command_dict) {
      separated.shift();
      separated.shift(); //removes 'add'
      let command_name = separated[0];
      separated.shift(); //removes the command name
      command_dict[command_name] = separated.join(" ");
      update_commmand_db();
      ret = [
        ret_codes.RetCodes.MODIFIED,
        "Command " + command_name + " was edited.",
      ];
    } else {
      ret = [
        ret_codes.RetCodes.ERROR,
        "Command " + separated[2] + " does not exist.",
      ];
    }
  } else if (separated[1] === "delete") {
    let command_name = separated[2];
    if (command_name in command_dict) {
      delete command_dict[command_name];
      update_commmand_db();
      ret = [
        ret_codes.RetCodes.DELETED,
        "Command " + command_name + " was deleted.",
      ];
    } else {
      ret = [
        ret_codes.RetCodes.ERROR,
        "Command " + command_name + " does not exist.",
      ];
    }
  } else {
    ret = [
      ret_codes.RetCodes.ERROR,
      "Wrong syntax error. See <path-to-link-of-docs> for more information",
    ];
  }
  return ret;
}

function alias_handler(separated) {
  if (separated.length < 5)
    return [
      ret_codes.RetCodes.ERROR,
      "Correct syntax: !alias <operation> <name> [command]",
    ];

  separated[1] = separated[1].toLowerCase();
  separated[2] = separated[2].toLowerCase();

  if (separated[1] === "add") {
    if (separated[2] in alias_dict) {
      // The alias exists
      return [
        ret_codes.RetCodes.ERROR,
        "Alias " + separated[2] + " already exists.",
      ];
    }

    if (separated[2] in alias_dict) {
      // The alias exists as an alias
      return [
        ret_codes.RetCodes.ERROR,
        "Alias " + separated[2] + " already exists as a command.",
      ];
    }

    separated.shift(); //removes '!alias'
    separated.shift(); //removes 'add'
    let alias_name = separated[0];
    separated.shift(); //removes the alias name
    alias_dict[alias_name] = separated.join(" ");
    update_alias_db();
    ret = [ret_codes.RetCodes.CREATED, "Alias " + alias_name + " was added."];
  } else if (separated[1] === "edit") {
    if (separated[2] in alias_dict) {
      separated.shift();
      separated.shift(); //removes 'add'
      let alias_name = separated[0];
      separated.shift(); //removes the alias name
      alias_dict[alias_name] = separated.join(" ");
      update_alias_db();
      ret = [
        ret_codes.RetCodes.MODIFIED,
        "Alias " + alias_name + " was edited.",
      ];
    } else {
      ret = [
        ret_codes.RetCodes.ERROR,
        "Alias " + separated[2] + " does not exist.",
      ];
    }
  } else if (separated[1] === "delete") {
    let alias_name = separated[2];
    if (alias_name in alias_dict) {
      delete alias_dict[alias_name];
      update_alias_db();
      ret = [
        ret_codes.RetCodes.DELETED,
        "Alias " + alias_name + " was deleted.",
      ];
    } else {
      ret = [
        ret_codes.RetCodes.ERROR,
        "Alias " + alias_name + " does not exist.",
      ];
    }
  } else {
    ret = [
      ret_codes.RetCodes.ERROR,
      "Wrong syntax error. See <path-to-link-of-docs> for more information",
    ];
  }
  return ret;
}

function permission_handler(separated) {
  if (separated[2] in command_dict || separated[2] in alias_dict) {
    if (separated[1] === "vip") {
      permission_dict[separated[2]] = 0;
      update_permission_db();
    }

    if (separated[1] === "mod") {
      permission_dict[separated[2]] = 1;
      update_permission_db();
    }

    if (separated[1] == "broadcaster") {
      permission_dict[separated[2]] = 2;
      update_permission_db();
    }

    if (separated[1] == "delete") {
      if (separated[2] in permission_dict) {
        delete permission_dict[separated[2]];
        update_permission_db();
      } else {
        return [
          ret_codes.RetCodes.ERROR,
          separated[2] + " does not have specific permissions.",
        ];
      }
    }

    return [
      ret_codes.RetCodes.OK,
      "Permission for " + separated[2] + " was updated.",
    ];
  }
}

function checkPermission(userstate, command) {
  if (command in permission_dict) {
    switch (permission_dict[command]) {
      case 0: // VIP
        return userstate.mod || "vip" in userstate.badges;
      case 1: // MOD
        return userstate.mod;
      case 2: // BROADCASTER
        console.log("broadcaster" in userstate.badges);
        return "broadcaster" in userstate.badges;
      default:
        // SHOULD NEVER GET HERE
        return false;
    }
  } else {
    return true;
  }
}

function command_parser(
  command,
  userstate /*Can be undefined*/,
  client,
  target
) {
  var reply;
  var separated = command.split(" ");
  separated[0] = separated[0].toLowerCase();

  switch (separated[0]) {
    case "!command_test":
      if (userstate && userstate.mod) reply = command_handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!alias_test":
      if (userstate && userstate.mod) reply = alias_handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!permission_test":
      if (userstate && userstate.mod) reply = permission_handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!choose_test":
      reply = choose.handler(separated);
      break;

    case "!randmon_test":
      reply = randmon.handler(separated);
      break;

    case "!metronome_test":
      reply = metronome.handler();
      break;

    case "!src_test":
      reply = src.handler(separated, client, target);
      break;

    case "!torrent_test":
      reply = torrent.handler(separated);
      break;

    case "!isredbar_test":
      reply = isredbar.handler(separated, client, target);
      break;

    case "!roll_test":
      reply = roll.handler(separated);
      break;

    case "!expr_test":
      reply = expr.handler(separated);
      break;

    case "!slots_test":
      reply = slots.handler(client, target, userstate.username);
      break;

    case "!weather_test":
      if (userstate && userstate.mod && process.env.WEATHER_API_KEY)
        reply = weather.handler(separated, client, target);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!quote_test":
      if (userstate && userstate.mod) reply = quote.handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    default:
      if (separated[0] in command_dict) {
        if (userstate && checkPermission(userstate, separated[0])) {
          reply = [ret_codes.RetCodes.OK, command_dict[separated[0]]];
        } else {
          reply = [RetCodes.FORBIDDEN, ""];
          // Send whisper to user to not clog chat up
          client.whisper(
            userstate.username,
            "You do not have permission to use " + separated[0]
          );
        }
      } else if (separated[0] in alias_dict) {
        if (userstate && checkPermission(userstate, separated[0])) {
          reply = command_parser(alias_dict[separated[0]], userstate);
        } else {
          reply = [RetCodes.FORBIDDEN, ""];
          // Send whisper to user to not clog chat up
          client.whisper(
            userstate.username,
            "You do not have permission to use " + separated[0]
          );
        }
      } else reply = [ret_codes.RetCodes.NOT_FOUND, ""];
      break;
  }
  return reply;
}

module.exports = {
  command_parser,
  load_command_db,
  load_alias_db,
  load_permission_db,
};
