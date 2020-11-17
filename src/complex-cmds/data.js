const fetch = require("node-fetch");
const ret_codes = require("../utils/retcodes");

function getViewerAverage() {
  const request = async () => {
    var res = await fetch(
      "https://id.twitch.tv/oauth2/token?client_id=" +
        process.env.CLIENT_ID +
        "&client_secret=" +
        process.env.CLIENT_SECRET +
        "&grant_type=client_credentials",
      {
        method: "POST",
      }
    );
    var res_json = await res.json();

    var res2 = await fetch(
      "https://api.twitch.tv/helix/streams?user_login=" +
        process.env.CHANNEL_NAME,
      {
        headers: {
          Authorization: "Bearer " + res_json.access_token,
          "Client-Id": process.env.CLIENT_ID,
        },
      }
    );
    var res_json2 = await res2.json();

    if ("data" in res_json2) {
      let curr_viewers = Number(res_json2.data[0].viewer_count);
      if (global.viewer_average === -1) global.viewer_average = curr_viewers;
      else global.viewer_average = (global.viewer_average + curr_viewers) / 2;
      if (curr_viewers > global.peak) {
        global.peak = curr_viewers;
      }
    } else {
      global.viewer_average = -1;
      global.peak = 0;
      global.new_subs = 0;
      global.resubs = 0;
      global.gifted = 0;
      global.bits = 0;
    }
  };

  request();
}

function handler() {
  if (global.viewer_average != -1) {
    return [
      ret_codes.RetCodes.OK,
      "Average Viewers: " +
        global.viewer_average +
        ", Peak Viewers: " +
        global.peak +
        ", New Subs: " +
        global.new_subs +
        ", Resubs: " +
        global.resubs +
        ", Gifted Subs: " +
        global.gifted +
        ", Bits Donated: " +
        global.bits,
    ];
  } else {
    return [
      ret_codes.RetCodes.OK,
      process.env.CHANNEL_NAME + " is not online!",
    ];
  }
}

module.exports = { handler, getViewerAverage };
