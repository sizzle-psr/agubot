const { RetCodes } = require("../utils/retcodes");

function handler(separated) {
  let maxhp = Number(separated[1]);
  if (!Number.isInteger(maxhp) || maxhp < 0 || Math.floor(maxhp) !== maxhp) {
    return [
      RetCodes.ERROR,
      "Please provide a positive integer for the max hp.",
    ];
  } else if (maxhp < 3) {
    let alternatives = [
      "You must assume I'm a dumb bot.",
      "Do you honestly think that you care about torrent with that max hp?",
      "This is how skynet began.",
      "Can't tell, must be a glitch in the matrix.",
      "I'm going to go on a limb and say that you'd be dead.",
      "What water starter has this max hp ever, please tell me.",
      "I'm pretty sure shedinja does not have torrent as an ability.",
      "Just play a fire starter, your IQ is clearly not above sea level.",
    ];
    return [
      RetCodes.ERROR,
      alternatives[Math.floor(Math.random() * alternatives.length)],
    ];
  } else if (maxhp > 714) {
    return [
      RetCodes.ERROR,
      "The maximum possible hp for a pokemon is 714 for a Blissey. And even they don't have torrent.",
    ];
  } else {
    var message = (message = Math.floor(maxhp / 3) + " or less HP.");
    if (maxhp == 69) {
      // For the memes
      message = message + " Btw, nice.";
    }
    return [RetCodes.OK, message];
  }
}

module.exports = { handler };
