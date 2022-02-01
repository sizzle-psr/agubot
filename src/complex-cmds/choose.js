function handler(separated_command, twitch_client, channel) {
  separated_command.shift(); // Removes "!choose"
  let str = separated_command.join(' '); // Joins the string back together
  let options = str.split('|'); // Separates into options
  if (options.length > 1) {
    twitch_client.say(channel, options[Math.floor(Math.random() * options.length)]);
  } else {
    if (options[0] !== '') {
      twitch_client.say(channel, "If you need to choose from 1 option you really don't need me.");
    } else {
      twitch_client.say(channel, 'Please provide at least 2 options separated_command by "|".');
    }
  }
}

module.exports = { handler };
