# Weather Mother リファクタリング戦略

## Phase 1: ディレクトリ構造の準備
- [x] 新しいディレクトリの作成
  ```bash
  mkdir -p src/{api,schedules,domain/{weather,notifications}}
  ```
- [x] 既存ファイルの確認と依存関係の整理

### 確認項目
- [x] すべての必要なディレクトリが作成されている
- [x] ディレクトリ構造が計画通りになっている
- [x] 既存のファイルとの競合がない

## Phase 2: 外部クライアント層の整理
- [x] `clients/jma.js`の実装
- [x] `clients/gemini.js`の実装
- [x] `clients/expo.js`の実装
- [x] `clients/firestore.js`の実装

### 確認項目
- [x] 各クライアントが独立して動作する
- [x] エラーハンドリングが適切に実装されている
- [x] ログ出力が適切に設定されている
- [x] 既存の機能を損なっていない

## Phase 3: 天気予報ドメインの実装
- [x] `domain/weather/weather-api-client.js`の実装
- [x] `domain/weather/mother-message-creator.js`の実装
- [x] `domain/weather/weather-storage.js`の実装
- [x] `domain/weather/index.js`での統合

### 確認項目
- [x] 各機能が独立して動作する
- [x] ドメインロジックが適切に分離されている
- [x] エラーハンドリングが実装されている
- [x] 既存の機能を損なっていない

## Phase 4: 通知ドメインの実装
- [x] `domain/notifications/notification-sender.js`の実装
- [x] `domain/notifications/user-preferences.js`の実装
- [x] `domain/notifications/index.js`での統合

### 確認項目
- [x] 各機能が独立して動作する
- [x] ドメインロジックが適切に分離されている
- [x] エラーハンドリングが実装されている
- [x] 既存の機能を損なっていない

## Phase 5: API層とスケジュール層の実装
- [x] `api/weather.js`の実装
- [x] `api/notifications.js`の実装
- [x] `schedules/weather.js`の実装
- [x] `schedules/notifications.js`の実装

### 確認項目
- [x] 各APIエンドポイントが正常に動作する
- [x] スケジュール関数が正常に動作する
- [x] エラーハンドリングが実装されている
- [x] 既存の機能を損なっていない

## Phase 6: テストスクリプトの作成
- [ ] `scripts/test/weather/test-tokyo.sh`の作成
- [ ] `scripts/test/weather/test-all-areas.sh`の作成
- [ ] `scripts/test/notifications/test-single-user.sh`の作成
- [ ] `scripts/test/notifications/test-multiple-users.sh`の作成

### 確認項目
- [ ] すべてのテストスクリプトが実行可能
- [ ] テストが期待通りの結果を返す
- [ ] エラーケースが適切に処理される

## Phase 7: 段階的な切り替えとテスト
- [ ] ローカルでの動作確認
- [ ] エミュレータでのテスト
- [ ] エラーケースのテスト
- [ ] 本番環境への影響確認

### 確認項目
- [ ] すべての機能が正常に動作する
- [ ] パフォーマンスに問題がない
- [ ] エラーハンドリングが機能している
- [ ] ログが適切に出力される

## Phase 8: クリーンアップ
- [ ] 不要になった古いファイルの削除
- [ ] READMEの更新
- [ ] コメントの整理

### 確認項目
- [ ] 不要なファイルが完全に削除されている
- [ ] ドキュメントが最新の状態に更新されている
- [ ] コードが整理され、適切にコメントされている
