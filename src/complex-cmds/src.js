const fetch = require('node-fetch');
const ret_codes = require('../utils/retcodes');

function handler(separated, client, target) {
    let game = separated[1];
    let place = separated[separated.length-1];
    separated.shift();
    separated.shift();
    separated.pop();
    let category = separated.join(' ');
    let url_game = 'https://www.speedrun.com/api/v1/games/' + game + '/categories';

    var game_name;
    const request = async () => {
        var res = await fetch('https://www.speedrun.com/api/v1/games/' + game);
        var res_json = await res.json();
        var names = await res_json.data.names;
        game_name = names.international;
    
        var cat_id;
        res = await fetch(url_game);
        res_json = await res.json();

        for (var cat in res_json.data) {
            if (res_json.data[cat].name === category) {
                cat_id = res_json.data[cat].id;
                break;
            }
        } 

        // Check if we found it
        let url_variable = 'https://www.speedrun.com/api/v1/categories/' + cat_id + '/variables';
        
        var variables = [];
        res = await fetch(url_variable);
        res_json = await res.json();
        for (var variable in res_json.data) {
            // console.log(res_json.data[variable]);
            variables[res_json.data[variable].id] = res_json.data[variable].values.default;
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
        run = data.runs[Number(place)-1];
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
        let user_id = run.run.players[0].id;
        let run_time_iso = run.run.times.primary;
        run_time = run_time_iso.replace("PT","").replace("H",":").replace("M",":").replace("S","");
        run_time = run_time.split(':');
        let tmp = run_time[0];
        run_time.shift();
        for (var t = 0; t < run_time.length; t++ ) {
            if (run_time[t].length < 2) run_time[t] = '0' + run_time[t];
        }
        run_time = run_time.join(':');
        run_time = tmp + ':' + run_time;
        res = await fetch('https://www.speedrun.com/api/v1/users/' + user_id);
        res_json = await res.json();
        data = await res_json.data;
        user_name = await data.names;
        message = await place + termination + ' place in ' + game_name + ' ' + category + ' is ' + user_name.international + ' with a time of ' + run_time + '.';
        client.say(target, message);
    }
    
    request();
    
    return [ret_codes.RetCodes.NOT_FOUND, ''];
}

module.exports = {handler};