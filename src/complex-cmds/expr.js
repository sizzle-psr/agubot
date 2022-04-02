const { create, all } = require("mathjs");

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

function handler(separated_command, twitch_client, channel_name) {
  if (separated_command.length < 2) {
    twitch_client.say(channel_name, "Correct syntax: !expr <expr>");
    return;
  }
  separated_command.shift();
  let expression = separated_command.join(" ");
  var expression_filtered = expression
    .match(/[0-9.+\-()^/\*a-zA-Z%!&|<>\ ]*/g, "")
    .join("");
  if (expression != expression_filtered) {
    twitch_client.say(
      channel_name,
      "That is not a valid expression. Please check any typos and try again."
    );
    return;
  }
  try {
    var ret = limitedEvaluate(expression);
    twitch_client.say(channel_name, String(ret));
    return;
  } catch (error) {
    console.log(error);
    twitch_client.say(channel_name, "Error when evaluating the expression.");
    return;
  }
}

module.exports = { handler };
