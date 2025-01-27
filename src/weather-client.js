const fetch = require("node-fetch");

async function getWeatherForecast(areaId) {
  try {
    // 入力された地域IDを6桁に整形
    const formattedAreaId = areaId.padStart(6, "0");
    const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${formattedAreaId}.json`;

    const response = await fetch(url);
    const weather = await response.json();
    return weather;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

module.exports = { getWeatherForecast };
