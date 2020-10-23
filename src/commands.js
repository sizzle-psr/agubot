const fs = require('fs');
const choose = require('./complex-cmds/choose');
const src = require('./complex-cmds/src');
const ret_codes = require('./utils/retcodes');

var command_dict;
var alias_dict;

function load_command_db(path) {
    if (!fs.existsSync(path)) command_dict = JSON.parse('{}');
    else {
        let rawdata = fs.readFileSync(path);
        command_dict = JSON.parse(rawdata);
    }
}

function load_alias_db(path) {
    if (!fs.existsSync(path)) alias_dict = JSON.parse('{}');
    else {
        let rawdata = fs.readFileSync(path);
        alias_dict = JSON.parse(rawdata);
    }
}

function update_commmand_db() {
    fs.writeFileSync(process.env.COMMAND_DB_PATH, JSON.stringify(command_dict));
}

function update_alias_db() {
    fs.writeFileSync(process.env.ALIAS_DB_PATH, JSON.stringify(alias_dict));
}

function command_handler(separated) {
    // TODO add -help
    if (separated[1] === "add") {
        if (separated[2] in command_dict) { // The command exists
            return [ret_codes.RetCodes.ERROR, "Command " + separated[2] + ' already exists.'];
        } 

        if (separated[2] in alias_dict) { // The command exists as an alias
            return [ret_codes.RetCodes.ERROR, "Command " + separated[2] + ' already exists as an alias.'];
        }

        separated.shift(); //removes "!command"
        separated.shift(); //removes "add"
        let command_name = separated[0];
        separated.shift(); //removes the command name
        command_dict[command_name] = separated.join(' ');
        update_commmand_db();
        ret = [ret_codes.RetCodes.CREATED, 'Command ' + command_name + ' was added.'];

    } else if (separated[1] === "edit") {
        if (separated[2] in command_dict) {
            separated.shift(); 
            separated.shift(); //removes "add"
            let command_name = separated[0];
            separated.shift(); //removes the command name
            command_dict[command_name] = separated.join(' ');
            update_commmand_db();
            ret = [ret_codes.RetCodes.MODIFIED, 'Command ' + command_name + ' was edited.'];
        } else {
            ret = [ret_codes.RetCodes.ERROR, "Command " + separated[2] + ' does not exist.'];
        }
    } else if (separated[1] === "delete") {
        let command_name = separated[2];
        if (command_name in command_dict) {
            delete command_dict[command_name];
            update_commmand_db();
            ret = [ret_codes.RetCodes.DELETED, 'Command ' + command_name + ' was deleted.'];
        } else {
            ret = [ret_codes.RetCodes.ERROR, 'Command ' + command_name + ' does not exist.'];
        }
    } else {
        ret = [ret_codes.RetCodes.ERROR, 'Wrong syntax error. See <path-to-link-of-docs> for more information'];
    }
    return ret;
}

function alias_handler(separated) {
    if (separated[1] === "add") {
        if (separated[2] in alias_dict) { // The alias exists
            return [ret_codes.RetCodes.ERROR, "Alias " + separated[2] + ' already exists.'];
        } 

        if (separated[2] in alias_dict) { // The alias exists as an alias
            return [ret_codes.RetCodes.ERROR, "Alias " + separated[2] + ' already exists as a command.'];
        }

        separated.shift(); //removes "!alias"
        separated.shift(); //removes "add"
        let alias_name = separated[0];
        separated.shift(); //removes the alias name
        alias_dict[alias_name] = separated.join(' ');
        update_alias_db();
        ret = [ret_codes.RetCodes.CREATED, 'Alias ' + alias_name + ' was added.'];

    } else if (separated[1] === "edit") {
        if (separated[2] in alias_dict) {
            separated.shift(); 
            separated.shift(); //removes "add"
            let alias_name = separated[0];
            separated.shift(); //removes the alias name
            alias_dict[alias_name] = separated.join(' ');
            update_alias_db();
            ret = [ret_codes.RetCodes.MODIFIED, 'Alias ' + alias_name + ' was edited.'];
        } else {
            ret = [ret_codes.RetCodes.ERROR, "Alias " + separated[2] + ' does not exist.'];
        }
    } else if (separated[1] === "delete") {
        let alias_name = separated[2];
        if (alias_name in alias_dict) {
            delete alias_dict[alias_name];
            update_alias_db();
            ret = [ret_codes.RetCodes.DELETED, 'Alias ' + alias_name + ' was deleted.'];
        } else {
            ret = [ret_codes.RetCodes.ERROR, 'Alias ' + alias_name + ' does not exist.'];
        }
    } else {
        ret = [ret_codes.RetCodes.ERROR, 'Wrong syntax error. See <path-to-link-of-docs> for more information'];
    }
    return ret;

}

function command_parser(command, userstate /*Can be undefined*/, client, target) { 
    var reply;
    var separated = command.split(' ');
    if (separated[0] === '!command_test') { // Check if it's a command modification (mod only)

        if (userstate && userstate.mod) reply = command_handler(separated);
        else reply = [ret_codes.RetCodes.ERROR, ''];

    } else if (separated[0] === '!alias_test') { // Check if it's an alias modification

        if (userstate && userstate.mod) reply = alias_handler(separated);
        else reply = [ret_codes.RetCodes.ERROR, ''];

    } else if (separated[0] === '!choose_test') { // Check if its an alias

        reply = choose.handler(separated);

    } if (separated[0] === '!src_test') { // Check if its an alias

        reply = src.handler(separated, client, target);

    } else if (separated[0] in command_dict) { // Check if its a simple command

        reply = [ret_codes.RetCodes.OK, command_dict[separated[0]]];

    } else if (separated[0] in alias_dict) { // Check if its an alias

        reply = command_parser(alias_dict[separated[0]], undefined);

    } else { // TODO add more complex commands

        reply = [ret_codes.RetCodes.NOT_FOUND, ''];

    }

    return reply;
}

module.exports = {command_parser, 
                  load_command_db,
                  load_alias_db};