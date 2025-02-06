/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { generateWeatherMessages } = require("./src/handlers/weather");
const { generateWeatherMessagesTest } = require("./src/handlers/weather/test");
const { sendMorningNotifications } = require("./src/handlers/notifications");
const { testNotifications } = require("./src/handlers/notifications/test");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// 天気予報関連
exports.generateWeatherMessages = generateWeatherMessages;
exports.generateWeatherMessagesTest = generateWeatherMessagesTest;

// 通知関連
exports.sendMorningNotifications = sendMorningNotifications;
exports.testNotifications = testNotifications;
