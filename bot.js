const { re, intersect } = require("mathjs");
const tmi = require("tmi.js");
const dotenv = require("dotenv").config();
const commands = require("./src/commands");
const quotes = require("./src/complex-cmds/quote");
const ret_codes = require("./src/utils/retcodes");
const data = require("./src/utils/data");
const data_command = require("./src/complex-cmds/data");
const cooldowns = require("./src/complex-cmds/cooldowns");

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: [process.env.CHANNEL_NAME],
};

commands.load_command_db(process.env.COMMAND_DB_PATH);
commands.load_alias_db(process.env.COMMAND_DB_PATH);
commands.load_permission_db(process.env.PERMISSION_DB_PATH);
data.load_pokemon_db(process.env.POKEMON_DB_PATH);
data.load_move_db(process.env.MOVE_DB_PATH);
quotes.load_quote_db(process.env.QUOTE_DB_PATH);
cooldowns.load_cds(process.env.CDS_DICT_DB_PATH, process.env.CDS_INDEX_DB_PATH);

// Create a client with our options
const client = new tmi.client(opts);

global.viewer_average = -1;
global.peak = 0;
global.new_subs = 0;
global.resubs = 0;
global.gifted = 0;
global.bits = 0;

data_command.getViewerAverage();
setInterval(data_command.getViewerAverage, 180000);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);
client.on("disconnected", onDisconnectedHandler);

// Data for
client.on("cheer", onCheerHandler);
client.on("giftpaidupgrade", onSubHandler);
client.on("resub", onSubHandler);
client.on("subgift", onGiftSubHandler);
client.on("subscription", onNewSubHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, userstate, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  const ret = commands.command_parser(commandName, userstate, client, target);
  if (ret[0] !== ret_codes.RetCodes.NOT_FOUND && ret[1] !== "") {
    client.say(target, ret[1]);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onDisconnectedHandler(reason) {
  console.log("I got disconnected because " + reason);
}

function onCheerHandler() {
  global.bits += Number(userstate.bits);
}

function onSubHandler() {
  global.resubs++;
}

function onGiftSubHandler() {
  global.gifted++;
}

function onNewSubHandler() {
  global.new_subs++;
}
