const { default_commands, non_permission_downgrade } = require('../utils/defaults');
const { insertDefaultCommandWithPermission, updateCommandWithPermission } = require('../utils/data');

async function async_permission_handler(separated_command, twitch_client, channel, pg_client) {
  const query = {
    text: 'SELECT * FROM command WHERE channel = $1 AND name = $2',
    values: [channel, separated_command[2]],
  };

  await pg_client
    .query(query)
    .then((res) => {
      var permission;
      if (separated_command[1] === 'vip') {
        permission = 1
      } else if (separated_command[1] === 'mod') {
        permission = 2
      } else if (separated_command[1] === 'broadcaster') {
        permission = 3
      } else {
        permission = 0
      }

      // Successful fetch
      if (res.rows.length === 1) {
        updateCommandWithPermission(separated_command[2], permission, channel, pg_client);
        twitch_client.say(channel, 'Permissions updated for ' + separated_command[2]);
      } else {
        // There is no command with this name in the database
        if (default_commands.indexOf(separated_command[2]) != -1) {
          if (non_permission_downgrade.indexOf(separated_command[2]) != -1 && permission < 2) {
            twitch_client.say(channel, 'You can\'t downgrade permissions below mod for ' + separated_command[2]);
          } else {
            insertDefaultCommandWithPermission(separated_command[2], permission, channel, pg_client);
            twitch_client.say(channel, 'Permissions updated for ' + separated_command[2]);
          }
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

function permission_handler(separated_command, is_broadcaster, twitch_client, channel, pg_client) {
  if (
    separated_command.length === 3 &&
    (separated_command[1] === 'vip' ||
      separated_command[1] === 'mod' ||
      separated_command[1] === 'broadcaster' ||
      separated_command[1] === 'delete')
  ) {
    if (separated_command[1] === 'broadcaster' && !is_broadcaster) {
      twitch_client.say(channel, 'Only broadcasters can elevate commands to broadcaster permission');
    } else {
      async_permission_handler(separated_command, twitch_client, channel, pg_client);
    }
  } else {
    twitch_client.say(channel, 'Correct Syntax: !permission <role> <command>');
  }
}

module.exports = {
  permission_handler,
};
