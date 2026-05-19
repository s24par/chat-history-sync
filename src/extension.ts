import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as config from './config';
import { exportSession } from './exporter';
import { parseSession } from './parser';
import { ChatSessionWatcher } from './watcher';

let output: vscode.OutputChannel;
let statusBar: vscode.StatusBarItem;
const lastSyncAt = new Map<string, number>();

function updateStatusBar(): void {
    if (config.isEnabled()) {
        statusBar.text = '$(save) Chat History: ON';
        statusBar.tooltip = 'Chat history auto-save is ON. Click to disable.';
    } else {
        statusBar.text = '$(circle-slash) Chat History: OFF';
        statusBar.tooltip = 'Chat history auto-save is OFF. Click to enable.';
    }
}

async function syncSession(filePath: string): Promise<void> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) { return; }

    output.appendLine(`[Sync] Processing: ${path.basename(filePath)}`);

    const session = parseSession(filePath);
    if (!session) {
        output.appendLine('[Sync] Could not parse session, skipping.');
        return;
    }
    if (session.turns.length === 0) {
        output.appendLine('[Sync] Session has no turns, skipping.');
        return;
    }

    try {
        const fileUri = await exportSession(
            session,
            folders[0].uri,
            config.getOutputPath(),
            config.getFormat(),
            config.getRetention(),
        );
        output.appendLine(`[Sync] Saved: ${fileUri.fsPath}`);
    } catch (err) {
        output.appendLine(`[Sync] Error writing file: ${err}`);
    }
}

export function activate(context: vscode.ExtensionContext): void {
    output = vscode.window.createOutputChannel('Chat History Sync');
    context.subscriptions.push(output);

    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = 'chatHistorySync.toggleAutoSave';
    statusBar.show();
    context.subscriptions.push(statusBar);
    updateStatusBar();

    // context.storageUri = workspaceStorage/{workspaceId}/{extensionId}/
    // The chatSessions directory is one level up from the extension's storage dir.
    if (!context.storageUri) {
        output.appendLine('[Init] No workspace storage URI available. Extension inactive.');
        return;
    }

    const watchDir = path.join(path.dirname(context.storageUri.fsPath), 'chatSessions');
    output.appendLine(`[Init] chatSessions path: ${watchDir}`);

    const watcher = new ChatSessionWatcher(watchDir, output, config.getDebounceMs());
    context.subscriptions.push(watcher);

    watcher.onDidChange(filePath => {
        if (config.isEnabled()) {
            const minSyncIntervalMs = config.getMinSyncIntervalMs();
            const now = Date.now();
            const previous = lastSyncAt.get(filePath) ?? 0;
            const elapsed = now - previous;

            if (previous > 0 && elapsed < minSyncIntervalMs) {
                output.appendLine(
                    `[Sync] Skipped: ${path.basename(filePath)} (${elapsed}ms < min ${minSyncIntervalMs}ms)`
                );
                return;
            }

            lastSyncAt.set(filePath, now);
            syncSession(filePath).catch(err =>
                output.appendLine(`[Sync] Unhandled error: ${err}`)
            );
        }
    });

    watcher.start();

    context.subscriptions.push(
        vscode.commands.registerCommand('chatHistorySync.saveNow', async () => {
            const folders = vscode.workspace.workspaceFolders;
            if (!folders) {
                vscode.window.showWarningMessage('Chat History Sync: No workspace folder is open.');
                return;
            }
            try {
                const files = fs.readdirSync(watchDir).filter(f => f.endsWith('.jsonl'));
                if (files.length === 0) {
                    vscode.window.showInformationMessage('Chat History Sync: No chat sessions found.');
                    return;
                }
                for (const file of files) {
                    await syncSession(path.join(watchDir, file));
                }
                vscode.window.showInformationMessage(
                    `Chat History Sync: Saved ${files.length} session(s).`
                );
            } catch (err) {
                vscode.window.showErrorMessage(`Chat History Sync: ${err}`);
            }
        }),

        vscode.commands.registerCommand('chatHistorySync.toggleAutoSave', async () => {
            const next = !config.isEnabled();
            await config.setEnabled(next);
            updateStatusBar();
            vscode.window.showInformationMessage(
                `Chat History Sync: Auto-save ${next ? 'enabled' : 'disabled'}.`
            );
        }),

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(config.EXTENSION_ID)) {
                updateStatusBar();
            }
        }),
    );

    output.appendLine('[Init] Chat History Sync activated.');
}

export function deactivate(): void {
    output?.appendLine('[Init] Chat History Sync deactivated.');
}
