const database_utils = require('../utils/data');
const { non_aliasable, default_commands } = require('../utils/defaults');

async function async_command_handler(twitch_client, separated_command, pg_client, channel, isAlias) {
  const query = {
    text: 'SELECT * FROM command WHERE channel = $1 AND LOWER(name) = LOWER($2)',
    values: [channel, separated_command[2]],
  };

  await pg_client
    .query(query)
    .then((res) => {
      // Successful fetch
      if (separated_command[1] === 'add') {
        if (res.rows.length === 0) {
          // Process string
          separated_command.shift(); //removes '!command'
          separated_command.shift(); //removes 'add'
          let command_name = separated_command[0];
          separated_command.shift(); //removes the command name

          // Upload to db
          database_utils.insertCommandFromChannel(
            command_name,
            separated_command.join(' '),
            channel,
            isAlias,
            pg_client
          );
          if (!isAlias) {
            twitch_client.say(channel, 'Command ' + command_name + ' was added.');
          } else {
            twitch_client.say(channel, 'Alias ' + command_name + ' was added.');
          }
        } else {
          if (!isAlias) {
            twitch_client.say(channel, 'Command ' + separated_command[2] + ' already exists.');
          } else {
            twitch_client.say(channel, 'Alias ' + separated_command[2] + ' already exists.');
          }
        }
      } else if (separated_command[1] === 'edit') {
        if (res.rows.length === 1) {
          // Process string
          separated_command.shift(); //removes '!command'
          separated_command.shift(); //removes 'edit'
          let command_name = separated_command[0];
          separated_command.shift(); //removes the command name

          // Upload to db
          database_utils.updateCommandOutput(
            command_name,
            channel,
            separated_command.join(' '),
            pg_client
          );

          if (!isAlias) {
            twitch_client.say(channel, 'Command ' + command_name + ' was updated.');
          } else {
            twitch_client.say(channel, 'Alias ' + command_name + ' was updated.');
          }
        } else {
          if (!isAlias) {
            twitch_client.say(channel, 'Command ' + separated_command[2] + ' does not exist.');
          } else {
            twitch_client.say(channel, 'Alias ' + separated_command[2] + ' does not exist.');
          }
        }
      } else {
        // Must be delete
        if (res.rows.length === 1) {
          let command_name = separated_command[2];
          // Upload to db
          database_utils.deleteCommandFromChannel(command_name, channel, pg_client);

          if (!isAlias) {
            twitch_client.say(channel, 'Command ' + command_name + ' was deleted.');
          } else {
            twitch_client.say(channel, 'Alias ' + command_name + ' was deleted.');
          }
        } else {
          if (!isAlias) {
            twitch_client.say(channel, 'Command ' + separated_command[2] + ' does not exist.');
          } else {
            twitch_client.say(channel, 'Alias ' + separated_command[2] + ' does not exist.');
          }
        }
      }
    })
    .catch((e) => {
      console.log('Could not fetch command/alias.');
      console.error(e.stack);
      twitch_client.say(channel, 'Error. Please contact the bot maintainer.');
    });
}

function command_handler(separated_command, channel, twitch_client, pg_client, isAlias) {
  if (separated_command.length < 3) {
    if (!isAlias) {
      twitch_client.say(channel, 'Correct syntax: !command <operation> <name> [command]');
    } else {
      twitch_client.say(channel, 'Correct syntax: !alias <operation> <name> [command]');
    }
    return;
  }

  separated_command[1] = separated_command[1].toLowerCase();
  separated_command[2] = separated_command[2].toLowerCase();

  if (
    (separated_command[1] === 'add' && separated_command.length >= 4) ||
    (separated_command[1] === 'edit' && separated_command.length >= 4) ||
    (separated_command[1] === 'delete' && separated_command.length === 3)
  ) {
    // 0      1    2          3
    // !alias add !something !asd
    // aliases must invoke commands
    if (separated_command.length >= 4 && !separated_command[3].startsWith('!') && isAlias) {
      twitch_client.say(channel, "Alias' commands must be commands.");
      // alias can't be in the blacklist
    } else if (
      separated_command.length >= 4 &&
      non_aliasable.indexOf(separated_command[3]) != -1 &&
      isAlias
    ) {
      twitch_client.say(channel, "You can't alias " + separated_command[2]);
      // new command can't have the same name as a default command
    } else if (default_commands.indexOf(separated_command[2]) != -1) {
      twitch_client.say(channel, separated_command[2] + ' is already a default command.');
    // } else if (separated_command.length >= 4 && !separated_command[2].startsWith('!')) {
    //   twitch_client.say(channel, 'Custom commands must start with !.');
    } else {
      async_command_handler(twitch_client, separated_command, pg_client, channel, isAlias);
    }
  } else {
    if (!isAlias) {
      twitch_client.say(channel, 'Correct syntax: !command <operation> <name> [command]');
    } else {
      twitch_client.say(channel, 'Correct syntax: !alias <operation> <name> [command]');
    }
  }
}

module.exports = {
  command_handler,
};
