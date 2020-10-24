const { concatLimit } = require('async');
const fetch = require('node-fetch');
const ret_codes = require('../utils/retcodes');

function handler(separated, client, target) {
    let game = separated[1];   
    separated.shift();
    separated.shift();
    let may_subcategory = separated.join(' ').split(' | ');
    var subcategory;

    if (may_subcategory.length > 1) { // Has subcategory
        subcategory = may_subcategory[1];
    }

    separated = may_subcategory[0].split(' ');

    let place = separated[separated.length-1];

    separated.pop();
    let category = separated.join(' ');
    let url_game = 'https://www.speedrun.com/api/v1/games/' + game + '/categories';

    var game_name;
    const request = async () => {
        var res = await fetch('https://www.speedrun.com/api/v1/games/' + game);
        var res_json = await res.json();

        if (res_json.status) {
            client.say(target, 'Could not find the game ' + game + '.');
            return;
        }

        game_name = await res_json.data.names.international;
    
        var cat_id;
        res = await fetch(url_game);
        res_json = await res.json();

        for (var cat in res_json.data) {
            if (res_json.data[cat].name.toLowerCase() === category.toLowerCase()) {
                cat_id = res_json.data[cat].id;
                break;
            }
        } 

        if (!cat_id) {
            client.say(target, category + ' is not a category of ' + game_name + '.');
            return; 
        }

        let url_variable = 'https://www.speedrun.com/api/v1/categories/' + cat_id + '/variables';
        
        var variables = [];
        res = await fetch(url_variable);
        res_json = await res.json();

        // !src_test pkmnfrlg Any% 1 | JPN
        if (subcategory) {
            // Take default value
            for (var variable in res_json.data) {
                for (var key in res_json.data[variable].values.values) {
                    if (subcategory.toLowerCase() === res_json.data[variable].values.values[key].label.toLowerCase()) {
                        variables[res_json.data[variable].id] = key;
                        break;
                    }
                }
            }
        } else {
            // Take default value
            for (var variable in res_json.data) {
                variables[res_json.data[variable].id] = res_json.data[variable].values.default;
            }
        }
        if (Object.keys(variables).length < 1) {
            client.say(target, subcategory + ' is not a valid subcategory of ' + game + ' ' + category + '.');
            return;
        }
        
        let url = 'https://www.speedrun.com/api/v1/leaderboards/' + game + '/category/' + cat_id + '?';
        for (var key in variables) {
            url = url + 'var-' + key + '=' + variables[key] + '&'; 
        }
    
        if (place) {
            url = url + 'top=' + place;
        } else {ret_codes.RetCodes.OK
            url = url + 'top=1';
        }
    
        var user_name;
        var run_time;
        var message = 'ok';
        var termination;
        res = await fetch(url);
        let r = await res.json();
        let data = r.data;

        // Get the ordinal termination for the output message
        if (place.endsWith('13') || place.endsWith('12') || place.endsWith('11')) {
            termination = 'th';
        } else if (place.endsWith('3')) {
            termination = 'rd';
        } else if (place.endsWith('2')) {
            termination = 'nd';
        } else if (place.endsWith('1')) {
            termination = 'st';
        } else {
            termination = 'th';
        }

        if (data.runs.length < Number(place)) {
            client.say(target, game_name + ' ' + category + ' does not have a ' + place + termination + ' run. There are only ' + data.runs.length + ' runs.');
            return;
        }

        run = data.runs[Number(place)-1];
        let video_url = run.run.videos.links[0].uri;
        let user_id = run.run.players[0].id;
        let run_time_iso = run.run.times.primary;

        // Convert ISO8601 to readable format
        run_time = run_time_iso.replace("PT","").replace("H",":").replace("M",":").replace("S","");
        run_time = run_time.split(':');
        let tmp = run_time[0];
        run_time.shift();
        for (var t = 0; t < run_time.length; t++ ) {
            if (run_time[t].length < 2) run_time[t] = '0' + run_time[t];
        }
        run_time = run_time.join(':');
        run_time = tmp + ':' + run_time;

        // Get the user of the queried run
        res = await fetch('https://www.speedrun.com/api/v1/users/' + user_id);
        res_json = await res.json();
        data = await res_json.data;
        user_name = await data.names;
        if (!subcategory) {
            message = await place + termination + ' place in ' + game_name + ' ' + category + 
                     ' is ' + user_name.international + ' with a time of ' + run_time + '.';
        } else {
            message = await place + termination + ' place in ' + game_name + ' ' + category +
                     ' ' + subcategory + ' is ' + user_name.international + ' with a time of ' + run_time + '.';
        }
        message = message + ' | Video: ' + video_url;
        client.say(target, message);
    }
    
    request();
    
    return [ret_codes.RetCodes.NOT_FOUND, ''];
}

module.exports = {handler};