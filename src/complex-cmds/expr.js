const { create, all } = require("mathjs");
const { RetCodes } = require("../utils/retcodes");

const math = create(all);
const limitedEvaluate = math.evaluate;

math.import(
  {
    import: function () {
      throw new Error("Function import is disabled");
    },
    createUnit: function () {
      throw new Error("Function createUnit is disabled");
    },
    evaluate: function () {
      throw new Error("Function evaluate is disabled");
    },
    parse: function () {
      throw new Error("Function parse is disabled");
    },
    simplify: function () {
      throw new Error("Function simplify is disabled");
    },
    derivative: function () {
      throw new Error("Function derivative is disabled");
    },
  },
  { override: true }
);

// console.log(limitedEvaluate('sqrt(16)'))     // Ok, 4
// console.log(limitedEvaluate('parse("2+3")')) // Error: Function parse is disabled

function handler(separated) {
  if (separated.length < 2) {
    return [RetCodes.ERROR, "Correct syntax: !expr <expr>"];
  }
  separated.shift();
  let expression = separated.join(" ");
  return [RetCodes.OK, String(limitedEvaluate(expression))];
}

module.exports = { handler };
