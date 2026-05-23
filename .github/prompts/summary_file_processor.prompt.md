---
name: summary_file_processor
description: "Use when generating summary_*.md from chat export markdown in .chat-history/. No-argument mode must list candidates and ask user to select one file or all."
agent: agent
argument-hint: "source file path or all [profile=default]"
---

Generate session summary files from `.chat-history/` exports.

This prompt is the only user-facing slash command for this workflow.

## Required Flow
1. If invoked without arguments:
	- discover candidates in `.chat-history/` (`*.md`, excluding basename `summary_*` and excluding `.chat-history/summary/`)
	- present the candidate list to the user
	- ask the user to select one file or `all`
	- wait for user input before any file processing
2. If invoked with an argument:
	- `all`: process all candidates
	- file path: process only that file
3. Resolve output profile:
	- use `default` when profile is omitted
	- if profile is specified, apply that profile's section and output rules
4. Generate summary outputs according to `.github/instructions/summary_file_format.instructions.md`.

## Behavior
- If no argument is provided, do not start processing until user selection is received.
- If an argument is provided, validate it against candidate rules before processing.

## Constraints
- Source candidates are `.md` files in `.chat-history/` excluding files whose basename starts with `summary_` and excluding `.chat-history/summary/`.
- Write outputs only to `.chat-history/summary/` and prefix output filenames with `summary_`.
- If a target summary file already exists, overwrite it to keep the summary synchronized with the latest source content.
- Follow `.github/instructions/summary_file_format.instructions.md` as the entry point, then apply:
	- `.github/instructions/summary_output_core.instructions.md`
	- `.github/instructions/summary_profile_default.instructions.md` when no explicit profile is provided.
