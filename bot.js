const tmi = require("tmi.js");
const dotenv = require("dotenv").config();
const commands = require("./src/commands");
const quotes = require("./src/complex-cmds/quote");
const ret_codes = require("./src/utils/retcodes");
const data = require("./src/utils/data");
const data_command = require("./src/complex-cmds/data");
const cooldowns = require("./src/complex-cmds/cooldowns");
const { Client } = require('pg');

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: [
    'sizzleskeleton'
  ],
  joinInterval: 3000,
};

// Connect to database
const pg_client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pg_client.connect();

global.COMMAND_DB_PATH = "./data/commands.json";
global.ALIAS_DB_PATH = "./data/aliases.json";
global.PERMISSION_DB_PATH = "./data/permissions.json";
global.QUOTE_DB_PATH = "./data/quotes.json";
global.POKEMON_DB_PATH = "./data/pokemon.json";
global.MOVE_DB_PATH = "./data/moves.json";
global.CDS_DICT_DB_PATH = "./data/cds_dict.json";
global.CDS_INDEX_DB_PATH = "./data/cds_index.json";
global.TOPCHATTERS_DB = "./data/topchatters.json";

// commands.load_command_db();
// commands.load_alias_db();
// commands.load_permission_db();
data.load_pokemon_db(global.POKEMON_DB_PATH);
data.load_move_db(global.MOVE_DB_PATH);
// quotes.load_quote_db(global.QUOTE_DB_PATH);
// cooldowns.load_cds(global.CDS_DICT_DB_PATH, global.CDS_INDEX_DB_PATH);

// Create a client with our options
const client = new tmi.client(opts);

global.viewer_average = -1;
global.num_polls = 0;
global.peak = 0;
global.new_subs = 0;
global.resubs = 0;
global.gifted = 0;
global.bits = 0;

global.fetch_viewers = setInterval(data_command.getViewerAverage, 180000);
data_command.getViewerAverage();

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
async function onMessageHandler(channel, userstate, msg, self) {
  try {
    if (self) {
      return;
    } // Ignore messages from the bot

    if (global.fetch_viewers === 0) {
      global.fetch_viewers = setInterval(data_command.getViewerAverage, 180000);
      data_command.getViewerAverage();
    }
    // Remove whitespace from chat message
    const commandName = msg.trim();

    const ret = await commands.command_parser(commandName, userstate, client, channel, pg_client);
    if (ret[0] !== ret_codes.RetCodes.NOT_FOUND && ret[1] !== "") {
      client.say(channel, ret[1]);
    }
  } catch (error) {
    console.log('"' + msg + '" failed its execution due to ' + error.message);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onDisconnectedHandler(reason) {
  console.log("I got disconnected because " + reason);
}

function onCheerHandler(target, userstate, message) {
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
