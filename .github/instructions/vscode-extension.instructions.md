---
description: "Use when developing VS Code extensions with TypeScript and Node.js, including command contributions, activation events, extension API usage, and packaging updates."
name: "VS Code Extension TypeScript Guidelines"
applyTo: ["src/**/*.ts", "test/**/*.ts", "package.json", "tsconfig.json", "**/*.code-workspace"]
---
# VS Code Extension Development Guidelines (TypeScript + Node.js)

- Prefer stable VS Code APIs first. If proposed APIs are required, document why and gate usage behind feature checks.
- Keep activation narrow. Use specific activation events and avoid `*` unless there is a clear, documented reason.
- Register commands in `package.json` and in code with matching IDs. Keep command IDs namespaced (for example: `myExtension.runTask`).
- Use `context.subscriptions` for all disposables (commands, providers, listeners) to prevent leaks.
- Avoid blocking the extension host. Use async APIs, debounce noisy listeners, and offload heavy work from activation.
- Validate user inputs and workspace assumptions. Show actionable errors via `window.showErrorMessage`.
- Prefer `workspace.fs` and URI-based APIs over Node `fs` when working with workspace resources.
- Log operational details through a dedicated output channel, and keep user-facing notifications concise.
- Keep `package.json` contributions, activation events, and implementation synchronized in the same change.
- Follow least-privilege principles for configuration and file access.

## Security Audit Alert Handling

- Run dependency audit checks before release work (`npm audit --omit=dev` and `npm audit`).
- Treat runtime dependency vulnerabilities as release blockers until fixed or explicitly accepted.
- For dev-only vulnerabilities, document risk and track upstream fixes; avoid forced overrides unless necessary.
- Re-run audit checks after dependency updates and record the result in the related PR or commit notes.
