---
name: summary_output_core
description: "Use when generating any summary_*.md output. Defines stable, profile-independent naming and write constraints."
---

# Summary Output Core Rules

## Purpose
Define mandatory rules that always apply regardless of profile.

## Output Directory
- Write summary files only under `.chat-history/summary/`.
- If the directory does not exist, create `.chat-history/summary/` before writing.

## File Naming
- Output file names must start with `summary_`.
- Recommended format:
  - `summary_<date>-<sanitized-title>-<sessionSuffix>.md`

## Naming Rules
- `<date>` uses `YYYY-MM-DD`.
- `<sanitized-title>` replaces unsafe characters with `-`, collapses repeated separators, and trims separators at ends.
- `<sessionSuffix>` is a deterministic short suffix from session ID (for example, last 8 alphanumeric characters).

## Source Selection Rules
- Source candidates are `.md` files in `.chat-history/`.
- Exclude source files whose basename starts with `summary_`.
- Exclude any files under `.chat-history/summary/`.

## Safety Rules
- Do not modify source files.
- Do not write files outside `.chat-history/`.
- If a summary file with the same output path already exists, overwrite it with the latest generated content.
