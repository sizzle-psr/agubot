const database_utils = require('../utils/data');
const { default_commands } = require('../utils/defaults');

function occurrences_plus_minus(string) {
  return (string.match(RegExp('(\\+|\\-)', 'ig')) || []).length;
}

async function async_counter_handler(twitch_client, separated_command, pg_client, channel) {
  const query = {
    text: 'SELECT * FROM counter WHERE channel = $1 AND name = $2',
    values: [channel, separated_command[2]],
  };

  await pg_client
    .query(query)
    .then((res) => {
      // Successful fetch
      if (separated_command[1] === 'add') {
        if (res.rows.length === 0) {
          // Process string
          separated_command.shift(); //removes '!counter'
          separated_command.shift(); //removes 'add'
          let counter_name = separated_command[0];
          separated_command.shift(); //removes the counter name

          // Upload to db
          database_utils.insertCounterFromChannel(counter_name, channel, pg_client);
          twitch_client.say(channel, 'Counter ' + counter_name + ' was added.');
        } else {
          twitch_client.say(channel, 'Counter ' + separated_command[2] + ' already exists.');
        }
      } else if (separated_command[1] === 'edit') {
        if (res.rows.length === 1) {
          // Process string
          separated_command.shift(); //removes '!counter'
          separated_command.shift(); //removes 'edit'
          let counter_name = separated_command[0];
          separated_command.shift(); //removes the counter name
          let value = separated_command[0];
          console.log(value);
          let separated_value = value.split('/');

          if (separated_value.length != 2) {
            twitch_client.say(channel, 'Correct syntax: !counter edit <name> <upper>/<lower>');
            return;
          }

          // Upload to db
          database_utils.updateCounter(
            counter_name,
            separated_value[0],
            separated_value[1],
            channel,
            pg_client
          );

          twitch_client.say(channel, 'Counter ' + counter_name + ' was updated.');
        } else {
          twitch_client.say(channel, 'Counter ' + separated_command[2] + ' does not exist.');
        }
      } else {
        // Must be delete
        if (res.rows.length === 1) {
          let counter_name = separated_command[2];
          // Upload to db
          database_utils.deleteCounterFromChannel(counter_name, channel, pg_client);

          twitch_client.say(channel, 'Counter ' + counter_name + ' was deleted.');
        } else {
          twitch_client.say(channel, 'Counter ' + separated_command[2] + ' does not exist.');
        }
      }
    })
    .catch((e) => {
      console.log('Could not fetch counter.');
      console.error(e.stack);
      twitch_client.say(channel, 'Error. Please contact the bot maintainer.');
    });
}

function counter_handler(separated_command, channel, twitch_client, pg_client) {
  if (separated_command.length < 3) {
    twitch_client.say(channel, 'Correct syntax: !counter <operation> <name>');
  }

  separated_command[1] = separated_command[1].toLowerCase();
  separated_command[2] = separated_command[2].toLowerCase();

  if (
    (separated_command[1] === 'add' && separated_command.length >= 3) ||
    (separated_command[1] === 'edit' && separated_command.length >= 3) ||
    (separated_command[1] === 'delete' && separated_command.length >= 3)
  ) {
    if (default_commands.indexOf(separated_command[2]) != -1) {
      twitch_client.say(channel, separated_command[2] + ' is already a default command.');
    } else if (!separated_command[2].startsWith('-')) {
      twitch_client.say(channel, 'Custom counters must start with "-".');
    } else {
      async_counter_handler(twitch_client, separated_command, pg_client, channel);
    }
  } else {
    twitch_client.say(channel, 'Correct syntax: !counter <operation> <name>');
  }
}

async function async_display_counter(separated_command, channel, twitch_client, pg_client) {
  const query = {
    text: 'SELECT * FROM counter WHERE channel = $1 AND name = $2',
    values: [channel, separated_command[0]],
  };

  await pg_client
    .query(query)
    .then((res) => {
      if (res.rows.length === 0) {
        twitch_client.say(channel, 'Counter ' + separated_command[0] + ' does not exist.');
      } else {
        let total = parseInt(res.rows[0]['total']);
        let successes = parseInt(res.rows[0]['successes']);
        let percentage = ((successes / total) * 100).toFixed(2);
        if (total === 0) percentage = 'I can do a lot of things, diving by 0 is not one of them';
        twitch_client.say(
          channel,
          separated_command[0] +
            ': ' +
            String(successes) +
            '/' +
            String(total) +
            ' -> ' +
            String(percentage) +
            '%.'
        );
      }
    })
    .catch((e) => {
      console.log('Could not fetch counter.');
      console.error(e.stack);
      twitch_client.say(channel, 'Error. Please contact the bot maintainer.');
    });
}

async function async_update_counter(separated_command, channel, twitch_client, pg_client) {
  const query = {
    text: 'SELECT * FROM counter WHERE channel = $1 AND name = $2',
    values: [channel, separated_command[0]],
  };

  await pg_client
    .query(query)
    .then((res) => {
      if (res.rows.length === 0) {
        twitch_client.say(channel, 'Counter ' + separated_command[0] + ' does not exist.');
      } else {
        let total = parseInt(res.rows[0]['total']);
        let successes = parseInt(res.rows[0]['successes']);

        pluses_minuses = separated_command[1].split('');
        let length = separated_command[1].length;

        for (i = 0; i < length; i++) {
          total += 1;
          if (separated_command[1][i] === '+') {
            successes += 1;
          }
        }

        database_utils.updateCounter(separated_command[0], successes, total, channel, pg_client);
        twitch_client.say(
          channel,
          separated_command[0] +
            ': ' +
            String(successes) +
            '/' +
            String(total) +
            ' -> ' +
            String((successes / total).toFixed(2) * 100) +
            '%.'
        );
      }
    })
    .catch((e) => {
      console.log('Could not fetch counter.');
      console.error(e.stack);
      twitch_client.say(channel, 'Error. Please contact the bot maintainer.');
    });
}

function update_counter(separated_command, channel, twitch_client, pg_client) {
  if (separated_command.length == 1) {
    async_display_counter(separated_command, channel, twitch_client, pg_client);
    return;
  }

  if (
    separated_command.length != 2 ||
    occurrences_plus_minus(separated_command[1]) != separated_command[1].length
  ) {
    twitch_client.say(channel, 'Correct syntax: <counter_name> [+/-]');
    return;
  }

  async_update_counter(separated_command, channel, twitch_client, pg_client);
}

module.exports = {
  counter_handler,
  update_counter,
};
