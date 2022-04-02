const fetch = require("node-fetch");

async function print_record(res, twitch_client, channel_name) {
  game_abbrv = res.rows[0]["game_abbrv"].trim();
  cat_id = res.rows[0]["cat_id"].trim();
  game_name = res.rows[0]["game_name"].trim();
  var_url_string = "";

  if (res.rows[0]["var_id"] != null) {
    var_id_string = res.rows[0]["var_id"].trim();
    var_value_string = res.rows[0]["var_value"].trim();

    var_ids = var_id_string.split(" ");
    var_values = var_value_string.split(" ");

    for (i = 0; i < var_ids.length; i++) {
      var_url_string =
        var_url_string + "&var-" + var_ids[i] + "=" + var_values[i];
    }
  }

  res = await fetch(
    "https://www.speedrun.com/api/v1/leaderboards/" +
      game_abbrv +
      "/category/" +
      cat_id +
      "?top=1" +
      var_url_string
  );
  res_json = await res.json();

  if (res.status != 200) {
    twitch_client.say(
      channel_name,
      "Record not found. Is the SRC API working?"
    );
    return;
  }

  record_runner_uri = res_json.data.runs[0].run.players[0].uri;

  res_runner = await fetch(record_runner_uri);

  res_runner_json = await res_runner.json();

  if (res_runner.status != 200) {
    twitch_client.say(
      channel_name,
      "Record Runner not found. Is the SRC API working?"
    );
    return;
  }
  record_runner_name = res_runner_json.data.names.international;

  // Get Game name
  record_game_uri = res_json.data.links[0].uri;
  record_game_res = await fetch(record_game_uri);
  record_game_res_json = await record_game_res.json();
  record_game_name = record_game_res_json.data.names.international;

  // Get category name
  record_cat_uri = res_json.data.links[1].uri;
  record_cat_res = await fetch(record_cat_uri);
  record_cat_res_json = await record_cat_res.json();
  record_cat_name = record_cat_res_json.data.name;

  record_date = res_json.data.runs[0].run.date;

  record_date = new Date(record_date).toDateString();
  record_video_url = res_json.data.runs[0].run.videos.links[0].uri;

  record_time = res_json.data.runs[0].run.times.realtime_t;

  record_hours = Math.floor(record_time / 60 / 60);
  record_minutes = Math.floor((record_time - 3600 * record_hours) / 60);
  record_seconds = Math.floor(
    record_time - 3600 * record_hours - 60 * record_minutes
  );

  output_string =
    "The WR for " +
    record_game_name +
    " " +
    record_cat_name +
    " was set by " +
    record_runner_name +
    " on " +
    record_date +
    " with a time of " +
    record_hours +
    "h" +
    record_minutes +
    "m" +
    record_seconds +
    "s. Run Video: " +
    record_video_url;

  twitch_client.say(channel_name, output_string);
}

async function async_handler(channel_name, twitch_client, pg_client) {
  const query = {
    text: "SELECT * FROM games WHERE channel = $1",
    values: [channel_name],
  };

  await pg_client.query(query).then((res) => {
    if (res.rows.length === 0) {
      twitch_client.say(
        channel_name,
        "No game is set. Please use !setgame to set a game."
      );
      return;
    } else if (res.rows.length === 1) {
      print_record(res, twitch_client, channel_name);
    }
  });
}

function handler(channel_name, twitch_client, pg_client) {
  async_handler(channel_name, twitch_client, pg_client);
}

module.exports = { handler };
