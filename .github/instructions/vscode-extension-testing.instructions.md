---
description: "Use when writing or updating tests for VS Code extensions with TypeScript, including command tests, integration flows, and extension host test setup with vscode-test and mocha."
name: "VS Code Extension Testing Guidelines"
applyTo: ["test/**/*.ts", "src/**/*.ts"]
---
# VS Code Extension Testing Guidelines

- Prefer `@vscode/test-electron` with `mocha` for extension host tests.
- Test observable behavior, not internal implementation details.
- Cover command registration and command execution paths when command logic changes.
- Use deterministic fixtures and avoid dependence on user-global state.
- Isolate workspace setup/teardown per suite to prevent cross-test leakage.
- Stub or control external side effects (network, timers, file system) where possible.
- Keep tests stable in CI: avoid brittle timing assertions and add explicit waits only when necessary.
- Assert both success and failure paths for user-facing operations.
- For diagnostics or messages, verify key content rather than exact full strings unless required.
- Add regression tests for fixed bugs when behavior previously broke.
- Keep test names task-oriented and readable (`should ... when ...`).
