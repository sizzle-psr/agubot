const { RetCodes } = require("../utils/retcodes");

function handler(separated) {
  if (separated.length < 6) {
    // Reply correct syntax
    return [RetCodes.ERROR, "Wrong Syntax"];
  }

  let pokemon = separated[2];
  let level = Number(separated[3]);

  if (!Number.isInteger(level) || level < 1 || level > 100) {
    return [RetCodes.ERROR, "Wrong Syntax"];
  }
  // percentage
  let hp = Number(separated[4]);

  if (!Number.isInteger(hp) || hp < 0 || hp > 100) {
    return [RetCodes.ERROR, "Wrong Syntax"];
  }

  let ball = separated[5];

  var status;
  if (separated.length === 7) {
    status = separated[7];
  }

  switch (separated[1]) {
    case "1":
      break;
    case "2":
      break;
    case "3":
      break;
    case "4":
      break;
    case "5":
      break;
    default:
      // ERROR
      break;
  }
}

function calc_rate_gen1(pokemon, level, hp, ball, status) {}

function calc_rate_gen3_4(pokemon, level, hp, ball, status) {}
