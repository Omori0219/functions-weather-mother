/**
 * Gemini AI クライアント
 * @file gemini.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");
const { GEMINI_API_KEY } = require("../config/environment");

/**
 * Gemini AIクライアント
 */
const geminiClient = {
  model: new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({ model: "gemini-pro" }),

  /**
   * 天気予報データを母のような口調で解説
   * @param {Object} weatherData - 天気予報データ
   * @returns {Promise<string>} 生成されたメッセージ
   * @throws {Error} AI生成エラー
   */
  async generateWeatherMessage(weatherData) {
    try {
      logger.info("天気予報メッセージの生成開始");

      const prompt = this._createPrompt(weatherData);
      const result = await this.model.generateContent(prompt);
      const message = result.response.text();

      logger.info("天気予報メッセージの生成完了");
      return message;
    } catch (error) {
      logger.error("天気予報メッセージの生成エラー", {
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * プロンプトの生成
   * @private
   * @param {Object} weatherData - 天気予報データ
   * @returns {string} 生成されたプロンプト
   */
  _createPrompt(weatherData) {
    return `
あなたは優しい母親として、以下の天気予報データを子供に説明するように解説してください。
心配しすぎず、でも必要な注意点は伝えるバランスの取れた説明をしてください。

天気予報データ:
${JSON.stringify(weatherData, null, 2)}

以下の点に注意して解説してください：
1. 温かみのある口調で
2. 具体的な服装や持ち物のアドバイス
3. 天気の変化に関する注意点
4. 前向きで楽しい雰囲気を保つ
`;
  },
};

module.exports = geminiClient;
