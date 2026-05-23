---
name: summary_profile_default
description: "Use when summary profile is default. 本文は日本語で、見出しキー名は英語固定の出力ルールを定義します。"
---

# Summary Profile: Default

## Profile ID
- `default`

## Language Policy
- このプロファイルの本文説明は日本語で記述する。
- 出力する要約ファイルの見出しキー名は英語固定とする。
- 固定キー:
  - `Overview`
  - `Detailed Execution`
  - `Report Points`

## Required Sections
1. `Overview`
2. `Detailed Execution`
3. `Report Points`

## Section Rules
### Overview
- セッションの主題と成果を高レベルで簡潔に要約する。

### Detailed Execution
- ターン単位で実施内容を記述する。
- 取得できる場合は timestamp と request ID を含める。
- 重要な意思決定、変更点、修正履歴を落とさず記録する。

### Report Points
- 報告先のレベル別に箇条書きを整理する。
- レベルキーは英語固定:
  - Executive
  - Manager
  - Developer

## Output Elements
- `.chat-history/summary/` 配下に Markdown 要約ファイルを出力する。
- 同一パスに既存ファイルがある場合は、最新内容で上書きする。
- 呼び出し側から要求がある場合、処理レポートを簡潔に含める:
  - processed count
  - skipped count
  - skip reasons
