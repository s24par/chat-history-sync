import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

type ChangeCallback = (filePath: string) => void;

/**
 * Watches the VS Code internal chatSessions directory for JSONL file changes.
 *
 * Uses Node's fs.watch (persistent: false) because the directory lives outside
 * the workspace folder and cannot be targeted by vscode.workspace.createFileSystemWatcher.
 * Changes are debounced to avoid processing partially-written files.
 */
export class ChatSessionWatcher implements vscode.Disposable {
    private readonly watchDir: string;
    private readonly output: vscode.OutputChannel;
    private readonly debounceMs: number;

    private watcher: fs.FSWatcher | undefined;
    private readonly debounceMap = new Map<string, ReturnType<typeof setTimeout>>();
    private readonly callbacks: ChangeCallback[] = [];

    constructor(watchDir: string, output: vscode.OutputChannel, debounceMs = 5000) {
        this.watchDir = watchDir;
        this.output = output;
        this.debounceMs = debounceMs;
    }

    /** Register a callback to be invoked when a .jsonl file changes (debounced). */
    onDidChange(callback: ChangeCallback): void {
        this.callbacks.push(callback);
    }

    /** Start watching. Safe to call even if the directory does not yet exist. */
    start(): void {
        if (!fs.existsSync(this.watchDir)) {
            this.output.appendLine(`[Watcher] Directory not found: ${this.watchDir}`);
            this.output.appendLine('[Watcher] Watching deferred until a chat session is opened.');
            return;
        }
        this.startWatcher();
    }

    private startWatcher(): void {
        try {
            this.watcher = fs.watch(this.watchDir, { persistent: false }, (_event, filename) => {
                if (filename && filename.endsWith('.jsonl')) {
                    this.scheduleCallback(path.join(this.watchDir, filename));
                }
            });
            this.output.appendLine(`[Watcher] Watching: ${this.watchDir}`);
        } catch (err) {
            this.output.appendLine(`[Watcher] Failed to start fs.watch: ${err}`);
        }
    }

    private scheduleCallback(filePath: string): void {
        const existing = this.debounceMap.get(filePath);
        if (existing) { clearTimeout(existing); }

        const timer = setTimeout(() => {
            this.debounceMap.delete(filePath);
            for (const cb of this.callbacks) {
                try { cb(filePath); } catch { /* isolate callback errors */ }
            }
        }, this.debounceMs);

        this.debounceMap.set(filePath, timer);
    }

    dispose(): void {
        for (const timer of this.debounceMap.values()) {
            clearTimeout(timer);
        }
        this.debounceMap.clear();
        this.watcher?.close();
        this.watcher = undefined;
    }
}
