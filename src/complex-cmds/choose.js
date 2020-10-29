const { RetCodes } = require('../commands');
const ret_codes = require('./../utils/retcodes');

function handler(separated) {
    separated.shift(); // Removes "!choose"
    let str = separated.join(' '); // Joins the string back together
    let options = str.split('|'); // Separates into options
    if (options.length > 1 ) {
        return [ret_codes.RetCodes.OK, options[Math.floor(Math.random() * options.length)]];
    } else {
        if (options[0] !== '') {
            return [ret_codes.RetCodes.ERROR, 'If you need to choose from 1 option you really don\'t need me.'];
        }
        return [ret_codes.RetCodes.ERROR, 'Please provide at least 2 options separated by \"|\".'];
    }
}

module.exports = {handler};