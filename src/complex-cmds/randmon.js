const { RetCodes } = require('../utils/retcodes');

function handler() {

    let num = Math.floor(Math.random() * global.pokemon_db.length);
    return [RetCodes.OK, 'Pkmn Trainer Red sent out ' + global.pokemon_db[num].name.english + '!'];
}

module.exports = {handler};