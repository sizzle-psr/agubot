const tmi = require('tmi.js');
const dotenv = require('dotenv').config();
const commands = require('./src/commands');
const ret_codes = require('./src/utils/retcodes');

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ]
};

commands.load_command_db(process.env.COMMAND_DB_PATH);
commands.load_alias_db(process.env.COMMAND_DB_PATH);

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, userstate, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();
  let ret = commands.command_parser(commandName, userstate);
  
  if (ret[0] !== ret_codes.RetCodes.NOT_FOUND) {
    client.say(target, ret[1]);
  } 

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onDisconnectedHandler(reason) {
  console.log("I got disconnected because " + reason);
}