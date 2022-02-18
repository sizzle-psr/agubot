const fetch = require('node-fetch');

function handler(separated_command, twitch_client, channel_name) {
  separated_command.shift();
  city = separated_command.join(' ');
  weather_url = 'https://api.weatherbit.io/v2.0/current?key='+ process.env.WEATHER_API_KEY
  if (city.indexOf(',') != -1) {
    city = city.split(',');
    weather_url = weather_url + '&city=' + city[0].trim() + '&country='+city[1].trim();
  } else {
    weather_url = weather_url + '&city=' + city.trim()
  }

  const request = async () => {
    var res = await fetch(
      weather_url
    );
    var res_json = await res.json();

    if (res_json.count < 1 || res.status != 200) {
      twitch_client.say(channel_name, 'Could not find ' + city + ' in the world atlas.');
      return;
    } else {
      let data = res_json.data[0];
      let city_name = data.city_name;
      let country_code = data.country_code;
      let wind_spd = Number(data.wind_spd) * 18/5;
      wind_spd = wind_spd.toFixed(1)
      let wind_spd_mph = wind_spd / 1.609344;
      wind_spd_mph = wind_spd_mph.toFixed(1)
      let temp = data.temp;
      let app_temp = data.app_temp;
      let farenheit = (Number(temp) * 9) / 5 + 32;
      farenheit = farenheit.toFixed(1);
      let app_farenheit = (Number(app_temp) * 9) / 5 + 32;
      app_farenheit = app_farenheit.toFixed(1);
      twitch_client.say(
        channel_name,
        city +
          ' (reporting for ' +
          city_name +
          ', ' + country_code + ')' +
          ' has a current forecast of ' +
          data.weather.description +
          ". It's " +
          data.temp +
          'º C (' +
          String(farenheit) +
          'º F) outside, with winds of ' + String(wind_spd) + ' km/h (' + String(wind_spd_mph) + ' mph), and it feels like ' +
          app_temp +
          'º C (' +
          String(app_farenheit) +
          'º F).'
      );
      return;
    }
  };

  request();

  return;
}

module.exports = { handler };
