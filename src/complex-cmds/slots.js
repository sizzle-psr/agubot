const fetch = require('node-fetch');

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

    //api.betterttv.net/2/emotes

    // Get bettertv general emotes
    var res2_ = await fetch('https://api.betterttv.net/2/emotes');
    var res_json2 = await res2_.json();

    if (res2_.status != 200) {
      client.say(target, 'Could not find bettertv emotes');
      return;
    }

    for (entry in res_json2.emotes) {
      emotes.push(res_json2.emotes[entry].code);
    }

    // Get bettertv general emotes
    var res7_ = await fetch('https://api.betterttv.net/2/channels/' + target.replace('#', ''));
    var res_json7 = await res7_.json();

    if (res7_.status != 200) {
      client.say(target, 'Could not find bettertv channel emotes');
      return;
    }

    for (entry in res_json7.emotes) {
      emotes.push(res_json7.emotes[entry].code);
    }

    // Get FrankerFaceZ global emotes
    var res3 = await fetch('https://api.frankerfacez.com/v1/set/global');
    var res_json3 = await res3.json();

    for (entry in res_json3.sets) {
      if (res_json3.sets[entry].id === 3) {
        for (i in res_json3.sets[entry].emotiocons) {
          emotes.push(res_json3.sets[entry].emotiocons[i].name);
        }
      }
    }

    // Get FrankerFaceZ channel emotes
    var res4 = await fetch('https://api.frankerfacez.com/v1/room/' + process.env.CHANNEL_NAME);
    var res_json4 = await res4.json();

    for (entry in res_json4.sets) {
      for (i in res_json4.sets[entry].emotiocons) {
        emotes.push(res_json3.sets[entry].emotiocons[i].name);
      }
    }

    if (emotes.length < 64) {
      if (global.lastFetch == -1 || (Date.now() - global.lastFetch) / 3600000 >= 0.5) {
        var res_auth = await fetch(
          'https://id.twitch.tv/oauth2/token?client_id=' +
            process.env.CLIENT_ID +
            '&client_secret=' +
            process.env.CLIENT_SECRET +
            '&grant_type=client_credentials',
          {
            method: 'POST',
          }
        );
        var res_auth_json = await res_auth.json();
        global.lastFetch = Date.now();
        // Get twitch emotes
        var res = await fetch('https://api.twitch.tv/helix/chat/emotes/global', {
          headers: {
            Authorization: 'Bearer ' + res_auth_json.access_token,
            'Client-Id': process.env.CLIENT_ID,
          },
        });
        var res_json = await res.json();

        if (res.status != 200) {
          client.say(target, 'Could not find twitch emotes');
          return;
        }

        global.twitchemotes = res_json.data;

        for (entry in res_json.data) {
          emotes.push(res_json.data[entry]['name']);
        }
      } else {
        for (entry in global.twitchemotes) {
          emotes.push(global.twitchemotes[entry]['name']);
        }
      }

      if (emotes.length < 64) {
        client.say(target, 'Could not find enough emotes to run slots!');
        return;
      }
    }
    // Randomize the array
    emotes = shuffle(emotes);

    var num1 = Math.floor(Math.random() * 16);
    var num2 = Math.floor(Math.random() * 16);
    var num3 = Math.floor(Math.random() * 16);

    client.say(target, user + ' -> ' + emotes[num1] + ' | ' + emotes[num2] + ' | ' + emotes[num3]);

    if (num1 === num2 && num2 === num3) {
      client.say(target, user + ' has won Slots!');
    }
  };

  request();

  // Done to not send anything to chat while we wait for API
  return;
}

module.exports = { handler };
