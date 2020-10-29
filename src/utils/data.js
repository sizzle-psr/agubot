const fs = require('fs');

function load_pokemon_db(path) {
    if (!fs.existsSync(path)) global.pokemon_db = JSON.parse('{}');
    else {
        let rawdata = fs.readFileSync(path);
        global.pokemon_db = JSON.parse(rawdata);
    }
}

function load_move_db(path) {
    if (!fs.existsSync(path)) global.move_db = JSON.parse('{}');
    else {
        let rawdata = fs.readFileSync(path);
        global.move_db = JSON.parse(rawdata);
    }
}

module.exports = {  
                load_move_db, 
                load_pokemon_db
                }