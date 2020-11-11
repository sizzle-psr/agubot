const { RetCodes } = require("../utils/retcodes");

function handler(separated) {
  if (separated.length < 2) {
    return [
      RetCodes.OK,
      "The roll returned " + (Math.floor(Math.random() * 100) + 1) + ".",
    ];
  }
  let max = Number(separated[1]);

  if (!Number.isInteger(max) || max <= 0) {
    return [RetCodes.ERROR, "AngryVoHiYo"];
  }

  return [
    RetCodes.OK,
    "The roll returned " + (Math.floor(Math.random() * max) + 1) + ".",
  ];
}

module.exports = { handler };
