const ret_codes = require("../utils/retcodes");
const fetch = require("node-fetch");

function handler(separated, client, target) {
  separated.shift();
  city = separated.join(" ");

  const request = async () => {
    var res = await fetch(
      "https://api.weatherbit.io/v2.0/current?city=" +
        city +
        "&key=" +
        process.env.WEATHER_API_KEY
    );
    var res_json = await res.json();

    if (res_json.count < 1) {
      client.say(target, "Could not find " + city + " in the world atlas.");
      return;
    } else {
      let data = res_json.data[0];
      let temp = data.temp;
      let farenheit = (Number(temp) * 9) / 5 + 32;
      client.say(
        target,
        city +
          " has a current forecast of " +
          data.weather.description +
          ". It's " +
          data.temp +
          "º C (" +
          String(farenheit) +
          "º F) outside."
      );
      return;
    }
  };

  request();

  return [ret_codes.RetCodes.OK, ""];
}

module.exports = { handler };
