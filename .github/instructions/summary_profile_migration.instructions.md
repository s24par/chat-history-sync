---
name: summary_profile_migration
description: "Use when migrating from single summary format definition to profile-based summary output configuration. 日本語本文運用と英語見出し固定の確認を含みます。"
---

# Summary Profile Migration Guide

## Goal
単一フォーマット定義からプロファイルベース構成へ移行し、挙動差分を最小化する。

## Current Baseline
- `default` プロファイルの挙動を従来出力と等価に保つ。

## Migration Steps
1. `.github/instructions/summary_file_format.instructions.md` を入口として維持する。
2. 共通で不変のルールを `.github/instructions/summary_output_core.instructions.md` に集約する。
3. 現在のセクション構成と出力要素を `.github/instructions/summary_profile_default.instructions.md` に移す。
4. prompt/skill の参照先を「entry point + core + default profile」に更新する。
5. 引数なしフロー（候補提示 -> ユーザー選択 -> 処理）を再検証する。
6. 出力が `.chat-history/summary/summary_*.md` を維持することを確認する。
7. プロファイル本文は日本語、見出しキー名は英語固定であることを確認する。

## Adding New Profile
1. `.github/instructions/summary_profile_template.instructions.md` をコピーする。
2. `.github/instructions/summary_profile_<new-id>.instructions.md` にリネームする。
3. プレースホルダーを置換し、`default` との差分を定義する。
4. core ルール（命名、出力先、安全制約）は変更しない。
5. 1件処理と all 処理の両方で実行テストを行う。

## Rollback Strategy
- active profile を `default` に戻す。
- カスタムプロファイルファイルは削除せず残す。
- ロールバック時に core ルールは変更しない。
