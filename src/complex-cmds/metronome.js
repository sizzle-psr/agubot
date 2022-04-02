const random = require("random");
function handler(twitch_client, channel_name) {
  let num = random.int(0, global.move_db.length - 1);
  twitch_client.say(
    channel_name,
    "Enemy Clefairy used " + global.move_db[num].ename + "!"
  );
}

module.exports = { handler };
