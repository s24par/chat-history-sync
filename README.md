# Chat History Sync

A VS Code extension that automatically saves GitHub Copilot Chat session history to your workspace.

## Features

- **Auto Save**: Monitors Copilot Chat session files and automatically exports conversations to your workspace whenever they are updated
- **Manual Save**: Instantly save all current sessions from the Command Palette
- **Status Bar**: Toggle auto-save ON/OFF with a single click on the icon in the bottom-right corner
- **Output Format**: Choose between Markdown (default), JSON, or both
- **Retention**: Save both user input and Copilot responses, or responses only

## Requirements

- VS Code 1.100.0 or later

## Installation

### For Users

Install the pre-built extension — no `npm install` or `npm run compile` required.

#### Option 1: Install from VSIX

1. Obtain the distributed `.vsix` file
2. Open the VS Code Command Palette
3. Run `Extensions: Install from VSIX...`
4. Select the `.vsix` file and reload VS Code

#### Option 2: Manual folder placement

If you have the pre-built extension folder, place it in the extensions directory for your OS:

| OS | Path |
|---|---|
| Linux / macOS | `~/.vscode/extensions/` |
| Windows | `%USERPROFILE%\.vscode\extensions\` |

Restart VS Code after placing the folder.

> Cloning this repository as-is gives you the source code only.  
> Without a build step, it cannot be used for user installation.

### For Developers

Use the following steps if you want to edit the source code or run the extension in the Extension Development Host.

**Additional requirements:**
- Node.js 20 or later
- npm

#### Setup

```bash
# Clone the repository
git clone <repository-url>
cd extention

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

#### Load in VS Code

1. Open this folder in VS Code
2. Press **F5** (or go to **Run** → **Start Debugging**)
3. An Extension Development Host window will open with the extension active

#### Building a VSIX for distribution

To install into a regular VS Code instance, package with `vsce package` and then install via
`Extensions: Install from VSIX...` in the Command Palette.

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
| `chatHistorySync.outputPath` | string | `.chat-history` | Output directory relative to the workspace root |
| `chatHistorySync.format` | `md` \| `json` \| `both` | `md` | Output file format |
| `chatHistorySync.retention` | `full` \| `output-only` | `full` | `full`: save user input + response / `output-only`: response only |
| `chatHistorySync.debounceMs` | number | `5000` | Milliseconds to wait after a file change before syncing |
| `chatHistorySync.minSyncIntervalMs` | number | `10000` | Minimum milliseconds between automatic syncs per session file |

### Example (settings.json)

```json
{
  "chatHistorySync.outputPath": "docs/chat-history",
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
