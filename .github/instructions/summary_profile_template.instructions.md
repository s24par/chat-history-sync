---
name: summary_profile_template
description: "Template for creating new summary output profiles. 日本語本文で作成し、見出しキー名は英語固定にします。"
---

# Summary Profile: <profile-id>

## Profile ID
- `<profile-id>`

## Language Policy
- このテンプレートから作成するプロファイル本文は日本語で記述する。
- 出力要約の見出しキー名は英語固定とする。
- 最低限固定する見出しキー:
	- `Overview`
	- `Detailed Execution`
	- `Report Points`

## Intent
- このプロファイルを使う場面を説明する。
- `default` と比較して、どの観点を強調するかを明記する。

## Required Sections
1. `Overview`
2. `Detailed Execution`
3. `Report Points`
4. `<Optional Section>`

## Section Rules
### Overview
- Purpose:
- Max length or bullet count:
- Required metadata:

### Detailed Execution
- Purpose:
- Max length or bullet count:
- Required metadata:

### Report Points
- Purpose:
- Max length or bullet count:
- Required metadata:

### <Optional Section>
- Purpose:
- Max length or bullet count:
- Required metadata:

## Report Levels
- Executive: <rule>
- Manager: <rule>
- Developer: <rule>

## Output Elements
- `.github/instructions/summary_output_core.instructions.md` の必須ルールを満たすこと。
- プロファイル固有の出力要素は必要最小限で追加すること。

## Validation Checklist
- `summary_` 命名と `.chat-history/summary/` 出力を守っている。
- 入力ソースファイルを変更しない。
- `default` との差分が明確である。
- 見出しキー名が英語固定である。
