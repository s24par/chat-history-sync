# Chat History Sync

GitHub Copilot Chat のセッション履歴をワークスペースへ自動保存する VS Code 拡張機能です。

## 機能

- **自動保存**: Copilot Chat のセッションファイルを監視し、更新時に会話を自動でエクスポート
- **手動保存**: コマンドパレットから現在のセッションを即時保存
- **ステータスバー**: 右下アイコンをクリックして自動保存の ON/OFF を切り替え
- **出力形式**: Markdown（既定）、JSON、または両方を選択可能
- **保持内容**: ユーザー入力と応答の両方、または応答のみを保存可能

## 要件

- Node.js 20 以降
- VS Code 1.100.0 以降

## インストール

このプロジェクトの配布フローは次のとおりです。

1. 開発者が拡張機能をビルドして .vsix を生成
2. 生成した .vsix を配布物として公開
3. 利用者が Command Palette から .vsix を導入

### 1. 開発者: VSIX をビルドして作成

このリポジトリには **ソースコードのみ** が含まれます。
ビルド済みの .vsix は同梱されていません。

要件:

- Node.js 20 以降
- npm

ビルドとパッケージ化:

```bash
npm install
npm run compile
npx @vscode/vsce package
```

上記で chat-history-sync-0.0.1.vsix のような VSIX ファイルが生成されます。

### 2. 開発者: 最小リリース自動化

最小構成のリリースフローは npm version を使います。

1. 作業ツリーがクリーンで、必要なコミットが完了していることを確認
2. いずれかのリリースコマンドを実行
3. package.json のバージョンが更新
4. Git のコミットとタグが自動作成
5. version ライフサイクルスクリプトで VSIX を生成

コマンド:

```bash
npm run release:patch
# または
npm run release:minor
# または
npm run release:major
```

リリース後にコミットとタグを push:

```bash
git push
git push --tags
```

### 3. 利用者: 配布された VSIX を導入

Command Palette から導入する手順:

1. Command Palette を開く
2. Extensions: Install from VSIX... を実行
3. 配布された .vsix ファイルを選択
4. 必要に応じて VS Code を再読み込み

CLI で導入する場合:

```bash
code --install-extension <vsix-file>
```

### 開発時のみの実行（VSIX 導入なし）

パッケージ化せずにローカル検証したい場合は Extension Development Host を使用します。

1. このフォルダーを VS Code で開く
2. F5 を押す（または Run -> Start Debugging）
3. Extension Development Host が起動し、拡張機能が有効化

### トラブルシュート

VSIX 作成時に engine mismatch などのエラーが出る場合は、まず Node.js のバージョンを確認してください。

- 必須: Node.js 20 以降
- 確認コマンド: `node -v`

nvm を使う場合:

- `nvm install 20`
- `nvm use 20`

nvm が未導入の場合は、OS のパッケージマネージャー等で Node.js を更新してください。

## 使い方

### 自動保存

拡張機能の有効化後、Copilot Chat セッションディレクトリを自動で監視します。
更新検知からおよそ 5 秒後に会話をワークスペースへ保存します。

同一セッションファイルに対する自動同期の最小間隔は 10 秒です。

ON/OFF の挙動:

- **ON**: 自動同期が動作
- **OFF**: 自動同期を一時停止
- OFF 中の会話は削除・除外されず、再度 ON にした後の次回同期で通常どおり書き出されます

既定の出力先:

```
<workspace root>/.chat-history/YYYY-MM-DD-<title>-<last 8 chars of sessionId>.md
```

### 手動保存

Command Palette（Ctrl+Shift+P）から実行:

| コマンド | 説明 |
|---|---|
| Chat History: Save Current Session Now | すべてのセッションを即時保存 |
| Chat History: Toggle Auto Save | 自動保存の ON/OFF を切り替え |

### ステータスバー

右下アイコンをクリックして自動保存を切り替えます。

- $(save) Chat History: ON - 自動保存が有効
- $(circle-slash) Chat History: OFF - 自動保存が無効

## 設定

設定は settings.json または VS Code の Settings UI から変更できます。

| キー | 型 | 既定値 | 説明 |
|---|---|---|---|
| chatHistorySync.enabled | boolean | true | 自動保存の有効/無効 |
| chatHistorySync.outputPath | string | .chat-history | ワークスペースルートからの相対出力先。サブディレクトリ指定可。 |
| chatHistorySync.format | md \| json \| both | md | 出力形式 |
| chatHistorySync.retention | full \| output-only | full | full はユーザー入力+応答、output-only は応答のみ保存 |
| chatHistorySync.debounceMs | number | 5000 | 変更検知後に同期するまでの待機ミリ秒 |
| chatHistorySync.minSyncIntervalMs | number | 10000 | 同一セッションファイルの自動同期最小間隔（ミリ秒） |

### 設定例（settings.json）

```json
{
  "chatHistorySync.outputPath": "docs/chat-history/subdir",
  "chatHistorySync.format": "both",
  "chatHistorySync.retention": "full",
  "chatHistorySync.debounceMs": 5000,
  "chatHistorySync.minSyncIntervalMs": 10000
}
```

both を選ぶと、同じベース名で .md と .json の両方が出力されます。

## 出力例

### Markdown

```markdown
# VS Code Extension Development Instructions

**Session ID:** `c46c63bb-9263-4842-9bd7-adf53c2981fd`
**Created:** 2026-05-18T18:09:00.068Z

---

## Turn 1

**User**

/create-instructions develop a vscode extension

**Copilot**
*Model: copilot/auto*

Here are the steps...
```

### JSON

```json
{
  "sessionId": "c46c63bb-...",
  "title": "VS Code Extension Development Instructions",
  "createdAt": "2026-05-18T18:09:00.068Z",
  "turns": [
    {
      "turn": 1,
      "timestamp": "2026-05-18T18:09:00.068Z",
      "modelId": "copilot/auto",
      "user": "/create-instructions develop a vscode extension",
      "assistant": "Here are the steps..."
    }
  ]
}
```

## 注意事項

- この拡張機能は VS Code の **内部ファイル形式**（workspaceStorage/*/chatSessions/*.jsonl）を直接読み取ります。VS Code 側のスキーマ変更により動作しなくなる可能性があります。
- 読み取り対象は **ローカル保存ファイルのみ** で、外部サーバーアクセスは行いません。
- 機密情報の誤コミット防止のため、.chat-history/ を .gitignore に追加することを推奨します。

## 開発

```bash
# 監視モードでコンパイル（変更時に自動再コンパイル）
npm run watch

# テスト実行
npm test
```

## ライセンス

MIT