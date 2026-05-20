# Chat History Sync

A VS Code extension that automatically saves GitHub Copilot Chat session history to your workspace.

## Features

- **Auto Save**: Monitors Copilot Chat session files and automatically exports conversations to your workspace whenever they are updated
- **Manual Save**: Instantly save all current sessions from the Command Palette
- **Status Bar**: Toggle auto-save ON/OFF with a single click on the icon in the bottom-right corner
- **Output Format**: Choose between Markdown (default), JSON, or both
- **Retention**: Save both user input and Copilot responses, or responses only

## Requirements

- Node.js 20 or later
- VS Code 1.100.0 or later

## Installation

This project uses the following distribution flow:

1. Developer builds the extension and generates a `.vsix`
2. That `.vsix` file is distributed as the release artifact
3. User installs the `.vsix` from the Command Palette

### 1. Developer: Build and package VSIX

This repository currently contains **source code only**.
No pre-built `.vsix` is bundled in the project files.

Requirements:

- Node.js 20 or later
- npm

Build and package:

```bash
npm install
npm run compile
npx @vscode/vsce package
```

This creates a VSIX file such as `chat-history-sync-0.0.1.vsix`.

### 2. Developer: Release automation (minimal)

Minimal release flow is based on `npm version`.

1. Ensure your working tree is clean and committed
2. Run one of the release commands
3. `package.json` version is updated
4. Git commit and tag are created automatically
5. VSIX is generated via the `version` lifecycle script

Commands:

```bash
npm run release:patch
# or
npm run release:minor
# or
npm run release:major
```

Push release commit and tag:

```bash
git push
git push --tags
```

### 3. User: Install distributed VSIX

Install from the Command Palette:

1. Open Command Palette
2. Run `Extensions: Install from VSIX...`
3. Select the distributed `.vsix` file
4. Reload VS Code if prompted

CLI alternative:

```bash
code --install-extension <vsix-file>
```

### Development-only run (without VSIX install)

If you want to test changes locally without packaging, run in Extension Development Host:

1. Open this folder in VS Code
2. Press **F5** (or go to **Run** -> **Start Debugging**)
3. An Extension Development Host window will open with the extension active

### Troubleshooting

If VSIX packaging fails with engine mismatch errors, check your Node.js version first.

- Required: Node.js 20 or later
- Check current version: `node -v`

If you use nvm:

- `nvm install 20`
- `nvm use 20`

If nvm is not installed, upgrade Node.js with your OS package manager.

## Usage

### Auto Save

When the extension activates, it automatically watches the Copilot Chat sessions directory.
Conversations are saved to the workspace approximately 5 seconds after an update is detected.

The minimum interval between automatic syncs for the same session file is 10 seconds.

ON/OFF behavior:

- **ON**: Auto-sync runs automatically.
- **OFF**: Auto-sync is paused.
- Conversations recorded while OFF are not deleted or excluded — they will be written out normally on the next sync after re-enabling.

Default output path:

```
<workspace root>/.chat-history/YYYY-MM-DD-<title>-<last 8 chars of sessionId>.md
```

### Manual Save

Run from the Command Palette (`Ctrl+Shift+P`):

| Command | Description |
|---|---|
| `Chat History: Save Current Session Now` | Save all sessions immediately |
| `Chat History: Toggle Auto Save` | Toggle auto-save ON/OFF |

### Status Bar

Click the icon in the bottom-right corner to toggle auto-save:

- `$(save) Chat History: ON` — Auto-save enabled
- `$(circle-slash) Chat History: OFF` — Auto-save disabled

## Configuration

Settings can be changed via `settings.json` or the VS Code Settings UI.

| Key | Type | Default | Description |
|---|---|---|---|
| `chatHistorySync.enabled` | boolean | `true` | Enable or disable automatic saving |
| `chatHistorySync.outputPath` | string | `.chat-history` | Relative output path from the workspace root. Subdirectories are allowed. |
| `chatHistorySync.format` | `md` \| `json` \| `both` | `md` | Output file format |
| `chatHistorySync.retention` | `full` \| `output-only` | `full` | `full`: save user input + response / `output-only`: response only |
| `chatHistorySync.debounceMs` | number | `5000` | Milliseconds to wait after a file change before syncing |
| `chatHistorySync.minSyncIntervalMs` | number | `10000` | Minimum milliseconds between automatic syncs per session file |

### Example (settings.json)

```json
{
  "chatHistorySync.outputPath": "docs/chat-history/subdir",
  "chatHistorySync.format": "both",
  "chatHistorySync.retention": "full",
  "chatHistorySync.debounceMs": 5000,
  "chatHistorySync.minSyncIntervalMs": 10000
}
```

When `both` is selected, the extension writes matching `.md` and `.json` files with the same base name.

## Output Examples

### Markdown

```markdown
# VS Code Extension Development Instructions

**Session ID:** `c46c63bb-9263-4842-9bd7-adf53c2981fd`
**Created:** 2026-05-18T18:09:00.068Z

---

## Turn 1
**Timestamp:** 2026-05-18T18:09:00.068Z
**Request ID:** request_d3e4f5a6-b7c8-4d9e-...

**User**

/create-instructions develop a vscode extension

**Copilot**
*Model: copilot/auto*

Here are the steps...
```

### JSON

```json
{
  "sessionId": "c46c63bb-...",
  "title": "VS Code Extension Development Instructions",
  "createdAt": "2026-05-18T18:09:00.068Z",
  "turns": [
    {
      "turn": 1,
      "timestamp": "2026-05-18T18:09:00.068Z",
      "requestId": "request_d3e4f5a6-b7c8-4d9e-...",
      "modelId": "copilot/auto",
      "user": "/create-instructions develop a vscode extension",
      "assistant": "Here are the steps..."
    }
  ]
}
```

## Notes

- This extension reads VS Code's **internal file format** (`workspaceStorage/*/chatSessions/*.jsonl`) directly. If VS Code updates change the schema, the extension may stop working.
- Only **locally stored files** are read — no external server access is performed.
- It is recommended to add `.chat-history/` to `.gitignore` to avoid accidentally committing conversations that may contain sensitive information.

## Development

```bash
# Compile in watch mode (auto-recompile on file changes)
npm run watch

# Run tests
npm test
```

## License

MIT
