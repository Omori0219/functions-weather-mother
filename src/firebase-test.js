require("dotenv").config();
const { saveWeatherData } = require("./firebase-client");

async function main() {
  try {
    await saveWeatherData();
    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error in main:", error);
    process.exit(1);
  }
}

main();
