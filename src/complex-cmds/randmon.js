const { RetCodes } = require("../utils/retcodes");

function handler(separated) {
  var gen_num;
  if (separated.length < 2) {
    gen_num = 3;
  } else {
    gen_num = Number(separated[1]);
  }

  if (!Number.isInteger(gen_num) || gen_num < 1 || gen_num > 8) {
    return [RetCodes.ERROR, "Correct syntax: !randmon [generation] [pokemon]"];
  }
  var num_pokes;
  if (gen_num == 1) num_pokes = 151;
  else if (gen_num == 2) num_pokes = 251;
  else if (gen_num == 3) num_pokes = 386;
  else if (gen_num == 4) num_pokes = 493;
  else if (gen_num == 5) num_pokes = 649;
  else if (gen_num == 6) num_pokes = 721;
  else if (gen_num == 7) num_pokes = 809;
  else num_pokes = global.pokemon_db.length;

  let num = Math.floor(Math.random() * num_pokes);
  return [
    RetCodes.OK,
    "Pkmn Trainer Red sent out " + global.pokemon_db[num].name.english + "!",
  ];
}

module.exports = { handler };
