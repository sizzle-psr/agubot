const { RetCodes } = require("../utils/retcodes");

function handler() {
  let num = Math.floor(Math.random() * global.move_db.length);
  return [
    RetCodes.OK,
    "Enemy Clefairy used " + global.move_db[num].ename + "!",
  ];
}

module.exports = { handler };
