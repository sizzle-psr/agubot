const { RetCodes } = require("../utils/retcodes");

function handler(separated, client, target) {
  let fraction = separated[1].split("/");

  if (fraction.length !== 2) {
    return [RetCodes.ERROR, "Correct syntax: !isredbar <fraction>"];
  }

  let current_hp = Number(fraction[0]);
  let maxhp = Number(fraction[1]);
  let ratio = current_hp / maxhp;

  if (
    !Number.isInteger(maxhp) ||
    !Number.isInteger(current_hp) ||
    ratio > 1 ||
    ratio <= 0
  ) {
    return [RetCodes.ERROR, "AngryVoHiYo"];
  }

  if (ratio <= 0.2) {
    client.say(target, "VoHiYo");
    return [RetCodes.OK, ""];
  }

  client.say(target, "VoHiYo");
  client.say(target, "VoHiYo");
  return [RetCodes.OK, ""];
}

module.exports = { handler };
