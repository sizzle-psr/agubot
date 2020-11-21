const ret_codes = require("../utils/retcodes");
const fs = require("fs");

var cooldown_dict = {};
var cooldown_index = {};

function load_cds(path_dict, path_index) {
  if (!fs.existsSync(path_dict)) cooldown_dict = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path_dict);
    cooldown_dict = JSON.parse(rawdata);
  }

  if (!fs.existsSync(path_index)) cooldown_index = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path_index);
    cooldown_index = JSON.parse(rawdata);
  }
}

function update_dict_db() {
  fs.writeFileSync(global.CDS_DICT_DB_PATH, JSON.stringify(cooldown_dict));
}

function update_index_db() {
  fs.writeFileSync(global.CDS_INDEX_DB_PATH, JSON.stringify(cooldown_index));
}

function is_on_cooldown(username, command) {
  if (!(command in cooldown_index)) return false;
  if (!(command in cooldown_dict)) {
    cooldown_dict[command] = {};
    cooldown_dict[command][username] = Date.now();
    update_dict_db();
    return false;
  } else {
    if (username in cooldown_dict[command]) {
      if (
        Date.now() - cooldown_dict[command][username] >
        cooldown_index[command] * 1000
      ) {
        cooldown_dict[command][username] = Date.now();
        update_dict_db();
        return false;
      } else return true;
    } else {
      cooldown_dict[command][username] = Date.now();
      update_dict_db();
      return false;
    }
  }
}

function handler(separated) {
  if (separated[1] === "add") {
    if (separated[2] in cooldown_index) {
      return [
        ret_codes.RetCodes.ERROR,
        "Cooldown for " + separated[2] + " already exists. Please use edit.",
      ];
    } else {
      cooldown_index[separated[2]] = separated[3];
      update_index_db();
      return [
        ret_codes.RetCodes.OK,
        "Cooldown of " +
          separated[3] +
          " seconds was added for " +
          separated[2] +
          ".",
      ];
    }
  }

  if (separated[1] === "edit") {
    if (separated[2] in cooldown_index) {
      cooldown_index[separated[2]] = separated[3];
      update_index_db();
      return [
        ret_codes.RetCodes.OK,
        "Cooldown of " +
          separated[3] +
          " seconds was edited for " +
          separated[2] +
          ".",
      ];
    } else {
      return [
        ret_codes.RetCodes.ERROR,
        "Cooldown for " + separated[2] + " does not exist.",
      ];
    }
  }

  if (separated[1] === "delete") {
    if (separated[2] in cooldown_index) {
      delete cooldown_index[separated[2]];
      update_index_db();
      return [
        ret_codes.RetCodes.OK,
        "Cooldown of " + separated[2] + " was deleted.",
      ];
    } else {
      return [
        ret_codes.RetCodes.ERROR,
        "Cooldown for " + separated[2] + " does not exist.",
      ];
    }
  }

  if (separated[1] === "info") {
    if (separated[2] in cooldown_index) {
      return [
        ret_codes.RetCodes.OK,
        separated[2] +
          " has a cooldown of " +
          cooldown_index[separated[2]] +
          " seconds.",
      ];
    } else {
      return [
        ret_codes.RetCodes.ERROR,
        "Cooldown for " + separated[2] + " does not exist.",
      ];
    }
  }
}

module.exports = { load_cds, is_on_cooldown, handler };
