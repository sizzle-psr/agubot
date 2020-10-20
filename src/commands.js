const fs = require('fs');

// const [first, second] = getValues();
var command_dict;

function load_command_db() {
    let rawdata = fs.readFileSync('commands.json');
    command_dict = JSON.parse(rawdata);
    // console.log(command_dict);
}

function update_commmand_db() {
    fs.writeFileSync('commands.json', JSON.stringify(command_dict));
}

function command_handler(separated) {
    var ret;
    // TODO add -help
    if (separated[1] === "add") { // Simple command added
        if (separated[2] in command_dict) { // The command exists
            ret = [RetCodes.ERROR, "Command " + command_name + ' already exists.'];
        } else {
            separated.shift(); //removes "!command"
            separated.shift(); //removes "add"
            let command_name = separated[0];
            separated.shift(); //removes the command name
            command_dict[command_name] = separated.join(' ');
            update_commmand_db();
            ret = [RetCodes.CREATED, 'Command ' + command_name + ' was added.'];
        }
    } else if (separated[1] === "!add") { // Complex command added
        // TODO
        ret = [RetCodes.ERROR, 'Functionality not yet implemented'];
    } else if (separated[1] === "edit") { // Simple command edit
        // TODO
        ret = [RetCodes.ERROR, 'Functionality not yet implemented'];
    } else if (separated[1] === "!edit") { // Complex command edit
        // TODO
        ret = [RetCodes.ERROR, 'Functionality not yet implemented'];
    } else if (separated[1] === "delete") {
        let command_name = separated[2];
        if (command_name in command_dict) {
            delete command_dict[command_name];
            update_commmand_db();
            ret = [RetCodes.DELETED, 'Command ' + command_name + ' was deleted.'];
        } else {
            ret = [RetCodes.ERROR, 'Command ' + command_name + ' does not exist.'];
        }
    } else {
        ret = [RetCodes.ERROR, 'Wrong syntax error. See <path-to-link-of-docs> for more information'];
    }
    return ret;
}

const RetCodes = {
    NOT_FOUND: -2,
    ERROR: -1,
    OK: 0,
    CREATED: 1,
    DELETED: 2, 
    MODIFIED: 3,
};

function command_parser(command) {
    var reply;
    var separated = command.split(' ');
    if (separated[0] in command_dict) { // Check if its a simple command
        reply = [RetCodes.OK, command_dict[separated[0]]];
    } else if (separated[0] === '!command_test') { // Check if it's a complex command
        reply = command_handler(separated);
    } else { // TODO add more complex commands
        reply = [RetCodes.NOT_FOUND, ''];
    }

    return reply;
}

module.exports = {command_parser, load_command_db, RetCodes};