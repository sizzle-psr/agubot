const { default_commands } = require('../utils/defaults');
const { insertDefaultCommandWithCooldown, updateCommandWithCooldown } = require('../utils/data');

function isNumeric(num) {
  return !isNaN(num)
}

async function async_cooldown_handler(separated_command, twitch_client, channel, pg_client) {
  const query = {
    text: 'SELECT * FROM command WHERE channel = $1 AND LOWER(name) = LOWER($2)',
    values: [channel, separated_command[2]],
  };

  await pg_client
    .query(query)
    .then((res) => {
      var cooldown = parseInt(separated_command[1]);

      // Successful fetch
      if (res.rows.length === 1) {
        updateCommandWithCooldown(separated_command[2], cooldown, channel, pg_client);
        twitch_client.say(channel, 'Cooldown updated for ' + separated_command[2]);
      } else {
        // There is no command with this name in the database
        if (default_commands.indexOf(separated_command[2]) != -1) {
          insertDefaultCommandWithCooldown(separated_command[2], cooldown, channel, pg_client);
          twitch_client.say(channel, 'Cooldown updated for ' + separated_command[2]);
        } else {
          twitch_client.say(channel, 'Command ' + separated_command[2] + ' is not defined');
        }
      }
    })
    .catch((e) => {
      console.log('Could not fetch command/alias.');
      console.error(e.stack);
      twitch_client.say(channel, 'Error. Please contact the bot maintainer');
    });
}

function cooldown_handler(separated_command, twitch_client, channel, pg_client) {
  if (separated_command.length === 3 && isNumeric(separated_command[1])) {
    async_cooldown_handler(separated_command, twitch_client, channel, pg_client);
  } else {
    twitch_client.say(channel, 'Correct Syntax: !cooldown <number> <command>');
  }
}

module.exports = {
  cooldown_handler,
};
