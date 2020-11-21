const fs = require("fs");
const { sep } = require("path");
const ret_codes = require("../utils/retcodes");

var quote_list = [];

function load_quote_db(path) {
  var quote_dict;
  if (!fs.existsSync(path)) quote_dict = JSON.parse("{}");
  else {
    let rawdata = fs.readFileSync(path);
    quote_dict = JSON.parse(rawdata);
  }

  for (key in quote_dict) {
    quote_list.push(quote_dict[key]);
  }
}

function update_quote_db() {
  var quote_dict = [];

  for (var i = 0; i < quote_list.length; i++) {
    quote_dict[i] = quote_list[i];
  }
  fs.writeFileSync(global.QUOTE_DB_PATH, JSON.stringify(quote_dict));
}

function handler(separated) {
  // !quote [add, delete] <user> <quote>
  if (separated.length < 2) {
    if (quote_list.length === 0) {
      return [ret_codes.RetCodes.ERROR, "Cannot fetch quote of empty list."];
    }

    let num = Math.floor(Math.random() * quote_list.length) + 1;
    return [
      ret_codes.RetCodes.OK,
      "Quote #" +
        num +
        " by " +
        quote_list[num - 1].user +
        ": " +
        quote_list[num - 1].quote,
    ];
  }

  if (separated[1] === "add") {
    if (separated.length < 4) {
      return [
        ret_codes.RetCodes.ERROR,
        "Correct Syntax: !quote add <user> <quote>",
      ];
    }

    let size = quote_list.length;
    quote_list.push(JSON.parse("{}"));
    quote_list[size].user = separated[2];
    separated.shift();
    separated.shift();
    separated.shift();
    let quote = separated.join(" ");
    quote_list[size].quote = quote;
    update_quote_db();
    return [
      ret_codes.RetCodes.OK,
      "Quote #" + (size + 1) + " by " + quote_list[size].user + " was added.",
    ];
  }

  if (separated[1] === "delete") {
    if (separated.length !== 3) {
      return [
        ret_codes.RetCodes.ERROR,
        "Correct Syntax: !quote delete <number>",
      ];
    }

    let num = Number(separated[2]);

    if (!Number.isInteger(num) || num < 1) {
      return [
        ret_codes.RetCodes.ERROR,
        "Please provide a positive integer for the quote number.",
      ];
    }

    if (num > quote_list.length) {
      return [ret_codes.RetCodes.ERROR, "Quote #" + num + " does not exist."];
    }
    delete quote_list[num - 1];
    quote_list.splice(num - 1, 1);
    update_quote_db();
    return [ret_codes.RetCodes.OK, "Quote #" + num + " was deleted."];
  }

  let num_quote = Number(separated[1]);
  if (!Number.isInteger(num_quote) || num_quote < 1) {
    return [
      ret_codes.RetCodes.ERROR,
      "Please provide a positive integer for the quote number.",
    ];
  }
  if (num_quote > quote_list.length) {
    return [
      ret_codes.RetCodes.ERROR,
      "Quote #" + num_quote + " does not exist.",
    ];
  }

  return [
    ret_codes.RetCodes.OK,
    "Quote #" +
      num_quote +
      " by " +
      quote_list[num_quote - 1].user +
      ": " +
      quote_list[num_quote - 1].quote,
  ];
}

module.exports = { handler, load_quote_db };
