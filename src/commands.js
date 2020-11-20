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
const { sep } = require("path");
const { handler } = require("./complex-cmds/slots");
const { columnDependencies } = require("mathjs");

var command_dict;
var alias_dict;
var permission_dict;

var complex_cmds = ["!randmon", "!metronome", "!src", "!slots", "!weather"];

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
  separated[1] = separated[1].toLowerCase();
  separated[2] = separated[2].toLowerCase();

  if (separated[1] === "add" && separated.length < 4) {
    if (separated.length < 4)
      return [
        ret_codes.RetCodes.ERROR,
        "Correct syntax: !command <operation> <name> [command]",
      ];
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
  } else if (separated[1] === "edit" && separated.length < 4) {
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
  } else if (separated[1] === "delete" && separated.length < 3) {
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
      "Correct syntax: !command <operation> <name> [command]",
    ];
  }
  return ret;
}

function alias_handler(separated) {
  separated[1] = separated[1].toLowerCase();
  separated[2] = separated[2].toLowerCase();

  if (separated[1] === "add" && separated.length < 4) {
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
  } else if (separated[1] === "edit" && separated.length < 4) {
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
  } else if (separated[1] === "delete" && separated.length < 3) {
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
      "Correct syntax: !alias <operation> <name> [command]",
    ];
  }
  return ret;
}

function permission_handler(separated) {
  if (separated.length < 3)
    return [
      ret_codes.RetCodes.ERROR,
      "Correct Syntax: !permission <role> <command>",
    ];
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
  } else {
    return [
      ret_codes.RetCodes.ERROR,
      separated[2] + " is not an existing alias/command.",
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
    case "!command":
      if (userstate && (userstate.mod || "broadcaster" in userstate.badges))
        reply = command_handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!alias":
      if (userstate && (userstate.mod || "broadcaster" in userstate.badges))
        reply = alias_handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!permission":
      if (userstate && (userstate.mod || "broadcaster" in userstate.badges))
        reply = permission_handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!data":
      reply = data.handler();
      break;

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

    case "!src":
      if (!cooldown.is_on_cooldown(userstate.username, "!metronome")) {
        reply = src.handler(separated, client, target);
      } else {
        reply = [ret_codes.RetCodes.ERROR, ""];
      }
      break;

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

    case "!slots":
      if (!cooldown.is_on_cooldown(userstate.username, "!slots")) {
        reply = slots.handler(client, target, userstate.username);
      } else {
        reply = [ret_codes.RetCodes.ERROR, ""];
      }
      break;

    case "!weather":
      if (
        userstate &&
        (userstate.mod || "broadcaster" in userstate.badges) &&
        process.env.WEATHER_API_KEY &&
        !cooldown.is_on_cooldown(userstate.username, "!weather")
      )
        reply = weather.handler(separated, client, target);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!quote":
      if (
        userstate &&
        (userstate.mod || "broadcaster" in userstate.badges) &&
        !cooldown.is_on_cooldown(userstate.username, "!quote")
      )
        reply = quote.handler(separated);
      else reply = [ret_codes.RetCodes.ERROR, ""];
      break;

    case "!cooldown":
      if (
        userstate &&
        (userstate.mod || "broadcaster" in userstate.badges) &&
        (complex_cmds.includes(separated[2]) ||
          separated[2] in command_dict ||
          separated[2] in alias_dict)
      ) {
        reply = cooldown.handler(separated);
      } else {
        reply = [
          ret_codes.ERROR,
          "You cannot add a cooldown to " + separated[2] + ".",
        ];
      }
      break;

    default:
      if (separated[0] in command_dict) {
        if (userstate && checkPermission(userstate, separated[0])) {
          reply = [ret_codes.RetCodes.OK, command_dict[separated[0]]];
        }
      } else if (separated[0] in alias_dict) {
        if (userstate && checkPermission(userstate, separated[0])) {
          reply = command_parser(alias_dict[separated[0]], userstate);
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
