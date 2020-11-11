const fetch = require("node-fetch");
const ret_codes = require("../utils/retcodes");

global.lastFetch = -1;
global.twitchemotes = undefined;

// Shuffles and array in place using the Fisher-Yates Shuffle
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function handler(client, target, user) {
  const request = async () => {
    var emotes = [];

    // Check if we have cached emotes
    if (
      global.lastFetch == -1 ||
      (Date.now() - global.lastFetch) / 3600000 >= 0.5
    ) {
      global.lastFetch = Date.now();
      // Get twitch emotes
      var res = await fetch("https://api.twitchemotes.com/api/v4/channels/0");
      var res_json = await res.json();

      if (res_json.status) {
        client.say(target, "Could not find twitch emotes");
        return;
      }

      global.twitchemotes = res_json.emotes;

      for (entry in res_json.emotes) {
        if (entry < 14) continue;
        emotes.push(res_json.emotes[entry].code);
      }
    } else {
      for (entry in global.twitchemotes) {
        if (entry < 14) continue;
        emotes.push(global.twitchemotes[entry].code);
      }
    }

    //api.betterttv.net/2/emotes

    // Get bettertv general emotes
    var res2 = await fetch("https://api.betterttv.net/2/emotes");
    var res_json2 = await res2.json();

    if (res_json2.status) {
      client.say(target, "Could not find bettertv emotes");
      return;
    }

    for (entry in res_json2.emotes) {
      emotes.push(res_json2.emotes[entry].code);
    }

    // Get FrankerFaceZ global emotes
    var res3 = await fetch("https://api.frankerfacez.com/v1/set/global");
    var res_json3 = await res3.json();

    for (entry in res_json3.sets) {
      if (res_json3.sets[entry].id === 3) {
        for (i in res_json3.sets[entry].emotiocons) {
          emotes.push(res_json3.sets[entry].emotiocons[i].name);
        }
      }
    }

    // Get FrankerFaceZ channel emotes
    var res4 = await fetch(
      "https://api.frankerfacez.com/v1/room/" + process.env.CHANNEL_NAME
    );
    var res_json4 = await res4.json();

    for (entry in res_json4.sets) {
      console.log(res_json4.sets[entry]);
      for (i in res_json4.sets[entry].emotiocons) {
        emotes.push(res_json3.sets[entry].emotiocons[i].name);
      }
    }

    if (emotes.length < 64) {
      client.say(target, "Could not find enough emotes to run slots!");
      return;
    }
    // Randomize the array
    emotes = shuffle(emotes);

    var num1 = Math.floor(Math.random() * 16);
    var num2 = Math.floor(Math.random() * 16);
    var num3 = Math.floor(Math.random() * 16);

    client.say(
      target,
      user + " -> " + emotes[num1] + " | " + emotes[num2] + " | " + emotes[num3]
    );

    if (num1 === num2 && num2 === num3) {
      client.say(target, user + " has won Slots!");
    }
  };

  request();

  // Done to not send anything to chat while we wait for API
  return [ret_codes.RetCodes.NOT_FOUND, ""];
}

module.exports = { handler };
