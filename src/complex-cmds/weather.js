const fetch = require("node-fetch");

const WEATHER_CODE = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  56: "Freezing Light Drizzle",
  57: "Freezing Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  66: "Freezing Light Rain",
  71: "Slight Snow Fall",
  73: "Moderate Snow Fall",
  75: "Heavy Snow Fall",
  77: "Snow Grains",
  80: "Sligh Rain Showers",
  81: "Moderate Rain Showers",
  82: "Heavy Rain Showers",
  85: "Slight Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
}

function handler(separated_command, twitch_client, channel_name) {
  separated_command.shift();
  city = separated_command.join(" ");
  geolocation_url = "https://api.api-ninjas.com/v1/geocoding?city="
  
  // Add city to geolocation url
  if (city.indexOf(",") != -1) {
    city = city.split(",");
    geolocation_url =
      geolocation_url + city[0].trim() + "&country=" + city[1].trim();
  } else {
    geolocation_url = geolocation_url + city.trim();
  }
  console.log(geolocation_url)
  const request_geo = async () => {
    var res = await fetch(geolocation_url, {
      headers: {'X-Api-Key': process.env.API_NINJA_KEY}
    });
    var res_json = await res.json();
    console.log(res_json)
    console.log(res)
    if (res_json == undefined || res == undefined || res_json.length < 1 || res.status != 200) {
      twitch_client.say(
        channel_name,
        "Could not find " + city + " in the world atlas."
      );
      return;
    } else {
      let data = res_json[0];
      let latitude = data.latitude
      let longitude = data.longitude
      let weather_url = "https://api.open-meteo.com/v1/forecast?latitude="+ latitude + "&longitude=" + longitude + "&current_weather=true"

      const request_weather = async() => {
        var res_weather = await fetch(weather_url);
        var res_weather_json = await res_weather.json();

        if (res_weather_json == undefined || res_weather == undefined || res_weather_json.length < 1 || res_weather.status != 200) {
          twitch_client.say(
            channel_name,
            "Error with the weather API. Contact the bot maintainer."
          );
          return;
        } else {
          let weather_data = res_weather_json;
          let weather_current = weather_data.current_weather
          let temperature = weather_current.temperature
          let windspeed = weather_current.windspeed
          let weather_code = weather_current.weathercode

          let farenheit = (Number(temperature) * 9) / 5 + 32;
          farenheit = farenheit.toFixed(1);

          let wind_spd_mph = windspeed / 1.609344;
          wind_spd_mph = wind_spd_mph.toFixed(1);

          twitch_client.say(
            channel_name,
            city +
              " has a current forecast of " +
              WEATHER_CODE[weather_code] +
              ". It's " +
              temperature +
              "º C (" +
              String(farenheit) +
              "º F) outside, with winds of " +
              String(windspeed) +
              " km/h (" +
              String(wind_spd_mph) +
              " mph)."
          );
          return;
        }
      }
      request_weather();
      return;
    }
  }

  request_geo();
  return;

  // weather_url = 
  // weather_url =
  //   "https://api.weatherbit.io/v2.0/current?key=" + process.env.WEATHER_API_KEY;

  // const request = async () => {
  //   var res = await fetch(weather_url);
  //   var res_json = await res.json();

  //   if (res_json.count < 1 || res.status != 200) {
  //     twitch_client.say(
  //       channel_name,
  //       "Could not find " + city + " in the world atlas."
  //     );
  //     return;
  //   } else {
  //     let data = res_json.data[0];
  //     let city_name = data.city_name;
  //     let country_code = data.country_code;
  //     let wind_spd = (Number(data.wind_spd) * 18) / 5;
  //     wind_spd = wind_spd.toFixed(1);
  //     let wind_spd_mph = wind_spd / 1.609344;
  //     wind_spd_mph = wind_spd_mph.toFixed(1);
  //     let temp = data.temp;
  //     let app_temp = data.app_temp;
  //     let farenheit = (Number(temp) * 9) / 5 + 32;
  //     farenheit = farenheit.toFixed(1);
  //     let app_farenheit = (Number(app_temp) * 9) / 5 + 32;
  //     app_farenheit = app_farenheit.toFixed(1);
  //     twitch_client.say(
  //       channel_name,
  //       city +
  //         " (reporting for " +
  //         city_name +
  //         ", " +
  //         country_code +
  //         ")" +
  //         " has a current forecast of " +
  //         data.weather.description +
  //         ". It's " +
  //         data.temp +
  //         "º C (" +
  //         String(farenheit) +
  //         "º F) outside, with winds of " +
  //         String(wind_spd) +
  //         " km/h (" +
  //         String(wind_spd_mph) +
  //         " mph), and it feels like " +
  //         app_temp +
  //         "º C (" +
  //         String(app_farenheit) +
  //         "º F)."
  //     );
      // return;
  //   }
  // };

  // request();

  // return;
}

module.exports = { handler };
