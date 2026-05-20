import * as vscode from 'vscode';
import * as path from 'path';
import type { OutputFormat } from './exporter';

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
    const value = vscode.workspace.getConfiguration(EXTENSION_ID).get<string>('outputPath', '.chat-history');
    return resolveOutputPath(value);
}

export function resolveOutputPath(outputPath: string): string {
    const trimmed = outputPath.trim();
    if (trimmed.length === 0) {
        throw new Error('Output path cannot be empty.');
    }

    const normalized = path.normalize(trimmed);
    if (path.isAbsolute(normalized)) {
        throw new Error('Output path must be relative to the workspace root.');
    }

    if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
        throw new Error('Output path must not escape the workspace root.');
    }

    return normalized;
}

export function getFormat(): OutputFormat {
    return vscode.workspace.getConfiguration(EXTENSION_ID).get<OutputFormat>('format', 'md');
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
