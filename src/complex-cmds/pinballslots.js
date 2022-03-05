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

    // Get FrankerFaceZ channel emotes
    var res4 = await fetch('https://api.frankerfacez.com/v1/room/' + target.replace('#', ''));
    var res_json4 = await res4.json();
    for (entry in res_json4.sets) {
      for (i in res_json4.sets[entry].emoticons) {
        let emote = res_json4.sets[entry].emoticons[i].name;
        if (emote.toLowerCase().startsWith('pin')) {
          emotes.push(res_json4.sets[entry].emoticons[i].name);
        }
      }
    }

    if (emotes.length < 16) {
      client.say(target, 'Could not find enough emotes to run slots!');
      return;
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
