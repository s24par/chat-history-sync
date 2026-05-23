---
name: summary_file_format
description: "Use when generating summary_*.md files from chat export sessions in .chat-history/. Defines naming and required markdown sections."
---

# Summary Format Entry Point

## Purpose
This file is the stable entry point for summary output rules.
It delegates detailed rules to split instruction files so that output format customization can be done with minimal impact.

## Split Configuration
- Core rules (always apply): `.github/instructions/summary_output_core.instructions.md`
- Default profile rules (current behavior): `.github/instructions/summary_profile_default.instructions.md`
- New profile template: `.github/instructions/summary_profile_template.instructions.md`
- Migration checklist: `.github/instructions/summary_profile_migration.instructions.md`

## Current Active Profile
- Active profile: `default`
- If no profile is specified, use `default`.

## Compatibility Rule
- Existing workflows that reference only this file remain valid.
- The effective output contract is: `core rules` + `default profile rules`.
