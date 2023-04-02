function handler(separated_command, twitch_client, channel_name) {
  if (separated_command.length != 3) {
    twitch_client.say(channel_name, "Correct syntax: !flail <currenthp> <maxhp>");
    return;
  }

  let current_hp = Number(separated_command[1]);
  let max_hp = Number(separated_command[2]);
  let ratio = current_hp / max_hp;

  if (
    !Number.isInteger(max_hp) ||
    !Number.isInteger(current_hp) ||
    ratio > 1 ||
    ratio <= 0
  ) {
    twitch_client.say(channel_name, "Please provide positive integers for the hp values, and a current hp less or equal than max hp");
    return;
  }

  if (ratio >= 0.6875) {
    twitch_client.say(channel_name, "Flail Power: 20");
    return;
  }

  if (ratio >= 0.3542) {
    twitch_client.say(channel_name, "Flail Power: 40");
    return;
  }

  if (ratio >= 0.2083) {
    twitch_client.say(channel_name, "Flail Power: 80");
    return;
  }

  if (ratio >= 0.0938) {
    twitch_client.say(channel_name, "Flail Power: 100");
    return;
  }

  if (ratio >= 0.0313) {
    twitch_client.say(channel_name, "Flail Power: 150");
    return;
  }

  twitch_client.say(channel_name, "Flail Power: 200");
  return;
}

module.exports = { handler };
