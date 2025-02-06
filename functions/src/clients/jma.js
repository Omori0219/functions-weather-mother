const logger = require("../utils/logger");

async function fetchWeatherForecast(areaId) {
  try {
    const formattedAreaId = areaId.padStart(6, "0");
    const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${formattedAreaId}.json`;

    const response = await fetch(url);
    const weather = await response.json();
    return weather;
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchWeatherForecast };
