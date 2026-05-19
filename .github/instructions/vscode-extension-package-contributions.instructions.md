---
description: "Use when editing VS Code extension package.json contributions, including commands, menus, keybindings, views, configuration, and activationEvents."
name: "VS Code Package Contributions Guidelines"
applyTo: ["package.json"]
---
# VS Code Package Contributions Guidelines

- Keep contribution points minimal, coherent, and discoverable.
- Ensure every contributed command has a matching implementation and consistent ID.
- Use clear command titles and categories to keep Command Palette search intuitive.
- Scope menu visibility with precise `when` clauses; avoid overly broad conditions.
- Add keybindings only when they are conflict-aware and context-appropriate.
- Keep `activationEvents` as narrow as possible and aligned with actual feature entry points.
- For configuration entries, provide explicit `type`, sensible `default`, and concise markdown descriptions.
- Group related settings with a stable prefix (for example: `myExtension.*`).
- Validate that view/container IDs are unique and consistently referenced.
- Update related docs and changelog notes when user-visible contributions change.
- In the same change, verify synchronization among `package.json`, runtime registration, and tests.
