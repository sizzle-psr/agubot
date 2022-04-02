const random = require('random');

function handler(separated_command, twitch_client, channel_name) {
  if (separated_command.length != 2) {
    twitch_client.say(channel_name, 'Correct syntax: !torrent maxhp');
    return;
  }

  let maxhp = Number(separated_command[1]);
  if (!Number.isInteger(maxhp) || maxhp < 0 || Math.floor(maxhp) !== maxhp) {
    twitch_client.say(channel_name, 'Please provide a positive integer for the max hp.');
    return;
  } else if (maxhp < 3) {
    let alternatives = [
      "You must assume I'm a dumb bot.",
      'Do you honestly think that you care about torrent with that max hp?',
      'This is how skynet began.',
      "Can't tell, must be a glitch in the matrix.",
      "I'm going to go on a limb and say that you'd be dead.",
      'What water starter has this max hp ever. Please tell me.',
      "I'm pretty sure shedinja does not have torrent as an ability.",
      "Just play a fire starter, I'm sure blaze will provide no problems for you.",
    ];
    twitch_client.say(channel_name, alternatives[random.int(0, alternatives.length - 1)]);
    return;
  } else if (maxhp > 714) {
    twitch_client.say(
      channel_name,
      "The maximum possible hp for a pokemon is 714 for a Blissey. And even they don't have torrent as their ability."
    );
    return;
  } else {
    var message = (message = Math.floor(maxhp / 3) + ' or less HP.');
    if (maxhp == 69) {
      // For the memes
      message = message + ' Btw, nice.';
    }
    twitch_client.say(channel_name, message);
    return;
  }
}

module.exports = { handler };
