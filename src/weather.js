const { getWeatherForecast } = require("./weather-client");

async function main() {
  // コマンドライン引数から地域IDを取得
  const areaId = process.argv[2];

  if (!areaId) {
    console.error("使用方法: node src/weather.js <地域ID>");
    console.error("例: node src/weather.js 130000");
    process.exit(1);
  }

  try {
    const weather = await getWeatherForecast(areaId);
    console.log(JSON.stringify(weather, null, 2));
  } catch (error) {
    console.error("Error in main:", error);
    process.exit(1);
  }
}

main();
