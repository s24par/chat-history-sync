---
name: summary-file-processor
description: 'Use for generating summary_*.md from chat export markdown files in .chat-history/. Supports single-file and batch-all processing in summary workflows.'
argument-hint: '[source file path or all] [profile=default]'
user-invocable: false
---

# Summary File Processor

This skill is internal-use for orchestration and is intentionally hidden from slash commands.

## When to Use
- Summarize a single exported chat markdown file.
- Batch-generate summaries for all export files in `.chat-history/`.
- Standardize summary output format for reporting.

## Input Rules
- Source candidates are `.md` files under `.chat-history/`.
- Exclude files whose basename starts with `summary_`.
- Exclude files under `.chat-history/summary/`.
- Optional argument:
  - file path for single processing
  - `all` for batch processing

## Procedure
1. Identify source candidates in `.chat-history/`.
2. If source is not specified:
  - present a candidate file list
  - ask the user to pick one file or `all`
  - wait for the user decision before processing
3. If source is specified, validate the input (`all` or a valid candidate file path).
4. Parse session structure from each source file:
   - `## Turn N`
   - `**Timestamp:`
   - optional `**Request ID:`
   - `**User**` and `**Copilot**` blocks
5. Resolve output profile (`default` if omitted).
6. Generate one `summary_*.md` per source based on `.github/instructions/summary_file_format.instructions.md`.

## Constraints
- Write generated files only to `.chat-history/summary/`.
- Do not modify original source files.
- Do not modify files outside `.chat-history/`.
- Overwrite existing summary files at the same output path with the latest generated content.
- Use `.github/instructions/summary_file_format.instructions.md` as the entry point.
- Apply core rules from `.github/instructions/summary_output_core.instructions.md`.
- Apply profile rules from `.github/instructions/summary_profile_default.instructions.md` when profile is not specified.

## Output
- Summary markdown file path(s).
- Existing files may be overwritten when regenerating summaries for updated source sessions.
- Short processing report:
  - number of files processed
  - number of files skipped
  - reasons for skips (if any)
