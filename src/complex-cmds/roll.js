const random = require('random');

function handler(separated_command, twitch_client, channel_name, user) {
  uniform_dist = random.uniform();
  if (separated_command.length < 2) {
    twitch_client.say(
      channel_name,
      user + ' -> The roll returned ' + String(Math.floor(uniform_dist() * 100 + 1)) + '.'
    );
    return;
  }
  let max = Number(separated_command[1]);

  if (!Number.isInteger(max) || max <= 1) {
    twitch_client.say(channel_name, user + ' -> AngryVoHiYo');
    return;
  }

  twitch_client.say(
    channel_name,
    user + ' -> The roll returned ' + String(Math.floor(uniform_dist() * max + 1)) + '.'
  );
}

module.exports = { handler };
