const fetch = require("node-fetch");

function ordinal_suffix_of(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

async function print_pb(res_runner_db, res, twitch_client, channel_name) {
  runner_name = res_runner_db.rows[0]["name"].trim();
  runner_id = res_runner_db.rows[0]["id"].trim();

  url =
    "https://www.speedrun.com/api/v1/users/" +
    runner_id +
    "/personal-bests?embed=game,category";

  game_abbrv = res.rows[0]["game_abbrv"].trim();
  cat_id = res.rows[0]["cat_id"].trim();

  cat_id = res.rows[0]["cat_id"].trim();
  game_name = res.rows[0]["game_name"].trim();
  var_ids = [];
  var_values = [];

  if (res.rows[0]["var_id"] != null) {
    var_id_string = res.rows[0]["var_id"].trim();
    var_value_string = res.rows[0]["var_value"].trim();

    var_ids = var_id_string.split(" ");
    var_values = var_value_string.split(" ");
  }

  res = await fetch(url);
  res_json = await res.json();

  if (res.status != 200 || res_json.data.length == 0) {
    twitch_client.say(
      channel_name,
      "No PB found for runner " + runner_name + "."
    );
    return;
  }

  var found_run = undefined;

  for (i = 0; i < res_json.data.length; i++) {
    let run = res_json.data[i];

    if (
      run.game.data.abbreviation === game_abbrv &&
      run.category.data.id === cat_id
    ) {
      var good_vars = true;
      for (j = 0; j < var_ids.length; j++) {
        if (run.run.values[var_ids[j]] != var_values[j]) {
          good_vars = false;
          break;
        }
      }

      if (good_vars) {
        found_run = run;
        break;
      }
    }
  }

  if (found_run === undefined) {
    twitch_client.say(
      channel_name,
      "No PB found for runner " + runner_name + "."
    );
    return;
  }

  // Get Place =

  // Get Game name
  pb_game_uri = found_run.run.links[1].uri;
  pb_game_res = await fetch(pb_game_uri);
  pb_game_res_json = await pb_game_res.json();
  pb_game_name = pb_game_res_json.data.names.international;

  // Get category name
  pb_cat_uri = found_run.run.links[2].uri;
  pb_cat_res = await fetch(pb_cat_uri);
  pb_cat_res_json = await pb_cat_res.json();
  pb_cat_name = pb_cat_res_json.data.name;

  pb_date = found_run.run.date;

  pb_date = new Date(pb_date).toDateString();
  pb_video_url = found_run.run.videos.links[0].uri;

  pb_time = found_run.run.times.realtime_t;

  pb_place = found_run.place;

  pb_hours = Math.floor(pb_time / 60 / 60);
  pb_minutes = Math.floor((pb_time - 3600 * pb_hours) / 60);
  pb_seconds = Math.floor(pb_time - 3600 * pb_hours - 60 * pb_minutes);

  output_string =
    runner_name +
    " has the " +
    ordinal_suffix_of(pb_place) +
    " place in " +
    pb_game_name +
    " " +
    pb_cat_name +
    ", set on " +
    pb_date +
    " with a time of " +
    pb_hours +
    "h" +
    pb_minutes +
    "m" +
    pb_seconds +
    "s. Run Video: " +
    pb_video_url;

  twitch_client.say(channel_name, output_string);
}

async function async_handler_async_handler(
  res_runner_db,
  twitch_client,
  channel_name,
  pg_client
) {
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
    } else {
      print_pb(res_runner_db, res, twitch_client, channel_name);
    }
  });
}

async function async_handler(channel_name, twitch_client, pg_client) {
  const query = {
    text: "SELECT * FROM runner WHERE channel = $1",
    values: [channel_name],
  };

  await pg_client.query(query).then((res) => {
    if (res.rows.length === 0) {
      twitch_client.say(
        channel_name,
        "No runner is set. Please use !setrunner to set a runner."
      );
      return;
    } else if (res.rows.length === 1) {
      async_handler_async_handler(res, twitch_client, channel_name, pg_client);
    }
  });
}

function handler(channel_name, twitch_client, pg_client) {
  async_handler(channel_name, twitch_client, pg_client);
}

module.exports = { handler };
