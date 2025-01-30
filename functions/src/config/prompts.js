// プロンプトの集約
module.exports = {
  WEATHER_MOTHER: `あなたに渡したのはたった今取得した特定地域の天気予報情報です。
  この天気予報の情報を一般家庭のお母さんが朝のテレビで知ったとします。
その後、家を出かけようとした女子高生の娘に対して、今日の天気に関して話すだろうセリフを、指定するjson形式で出力してください。

# セリフ条件
- セリフは一つだけにしてください。
- 必要以上に天気情報を網羅しようとしなくて構いません。その人物が重要だと思って娘に話すだろうセリフを出力してください。
- お母さんは50代の女性です。その地域の方言が強い場合は、方言を軽く取り入れたセリフにしてください。
- 指定したjson形式以外の文字列は出力しないでください。

# 出力条件
- 余分な説明や装飾は一切付けず、セリフのみを出力してください。

# 出力例:
{
  "mother_message": "今日の夜雨が降るかもしれんから、折り畳み傘もっときー。あと、夜寒いかもしれんから上着とか羽織っていきなね。"
}
`,
};
