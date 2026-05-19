import * as vscode from 'vscode';

export const EXTENSION_ID = 'chatHistorySync';

function getNumberSetting(key: string, fallback: number): number {
    const value = vscode.workspace.getConfiguration(EXTENSION_ID).get<number>(key, fallback);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        return fallback;
    }
    return Math.floor(value);
}

export function isEnabled(): boolean {
    return vscode.workspace.getConfiguration(EXTENSION_ID).get<boolean>('enabled', true);
}

export function setEnabled(value: boolean): Thenable<void> {
    return vscode.workspace.getConfiguration(EXTENSION_ID)
        .update('enabled', value, vscode.ConfigurationTarget.Global);
}

export function getOutputPath(): string {
    return vscode.workspace.getConfiguration(EXTENSION_ID).get<string>('outputPath', '.chat-history');
}

export function getFormat(): 'md' | 'json' {
    return vscode.workspace.getConfiguration(EXTENSION_ID).get<'md' | 'json'>('format', 'md');
}

export function getRetention(): 'full' | 'output-only' {
    return vscode.workspace.getConfiguration(EXTENSION_ID)
        .get<'full' | 'output-only'>('retention', 'full');
}

export function getDebounceMs(): number {
    return getNumberSetting('debounceMs', 5000);
}

export function getMinSyncIntervalMs(): number {
    return getNumberSetting('minSyncIntervalMs', 10000);
}
