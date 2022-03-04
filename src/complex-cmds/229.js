function handler(twitch_client, channel_name) {
  const outcome = Math.floor(Math.random() * 1214);

  if (outcome == 0) {
    twitch_client.say(channel_name, '229');
  } else if (outcome < 6) {
    twitch_client.say(channel_name, '230');
  } else if (outcome < 107) {
    twitch_client.say(channel_name, '231');
  } else if (outcome < 1108) {
    twitch_client.say(channel_name, '232');
  } else if (outcome < 1209) {
    twitch_client.say(channel_name, '233');
  } else if (outcome < 1214) {
    twitch_client.say(channel_name, '233');
  }
}

module.exports = { handler };
