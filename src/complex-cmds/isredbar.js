function handler(separated_command, twitch_client, channel_name) {
  if (separated_command.length != 2) {
    twitch_client.say(channel_name, "Correct syntax: !isredbar <fraction>");
    return;
  }

  let fraction = separated_command[1].split("/");

  if (fraction.length !== 2) {
    twitch_client.say(channel_name, "Correct syntax: !isredbar <fraction>");
    return;
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
    twitch_client.say(channel_name, "AngryVoHiYo");
    return;
  }

  if (ratio <= 0.2) {
    twitch_client.say(channel_name, "VoHiYo");
    return;
  }

  twitch_client.say(channel_name, "VoHiYo");
  twitch_client.say(channel_name, "VoHiYo");
  return;
}

module.exports = { handler };
