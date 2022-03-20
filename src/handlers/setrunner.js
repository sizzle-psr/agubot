const fetch = require('node-fetch');
const { insertRunner } = require('../utils/data');

async function async_setrunner_handler(runner, channel, twitch_client, pg_client) {
  const url_runner = 'https://www.speedrun.com/api/v1/users?lookup=' + runner;

  // Fetch runner data
  const result = await fetch(url_runner);
  const res_json = await result.json();

  if (result.status != 200 || res_json.data.length == 0) {
    twitch_client.say(channel, 'Runner \"' + runner + '\" not found.');
    return;
  }

  const runner_id = res_json.data[0].id;
  const runner_found_name = res_json.data[0].names.international;

  // If we got here, we found a runner
  insertRunner(
    runner_found_name,
    runner_id,
    pg_client,
    channel
  );
  twitch_client.say(channel, 'Runner was set to ' + runner_found_name + '.');
}

function setrunner_handler(separated_command, channel, twitch_client, pg_client) {
  // !setrunner sizzleskeleton
  // Remove !setrunner
  separated_command.shift();

  new_string = separated_command;

  if (new_string.length != 1) {
    twitch_client.say(channel, 'Correct syntax: !setrunner <runner>');
    return;
  } else {
    async_setrunner_handler(new_string[0].trim(), channel, twitch_client, pg_client);
  }
}

module.exports = {
  setrunner_handler,
};
