const logger = require("../utils/logger");

async function getWeatherForecast(areaId) {
  try {
    const formattedAreaId = areaId.padStart(6, "0");
    const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${formattedAreaId}.json`;

    logger.debug("気象庁APIにリクエストを送信", {
      areaId: formattedAreaId,
      url,
    });

    const response = await fetch(url);
    const weather = await response.json();

    logger.info("気象庁APIからデータを取得しました", {
      areaId: formattedAreaId,
      dataSize: JSON.stringify(weather).length,
    });

    return weather;
  } catch (error) {
    logger.error("気象庁APIからのデータ取得に失敗しました", error, {
      areaId,
      formattedAreaId: areaId.padStart(6, "0"),
    });
    throw error;
  }
}

module.exports = { getWeatherForecast };
