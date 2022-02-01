function handler(twitch_client, channel_name) {
  let num = Math.floor(Math.random() * global.move_db.length);
  twitch_client.say(channel_name, "Enemy Clefairy used " + global.move_db[num].ename + "!");
}

module.exports = { handler };
