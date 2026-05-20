import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { exportSession } from '../src/exporter';
import { resolveOutputPath } from '../src/config';
import type { ParsedSession } from '../src/parser';

function createSampleSession(): ParsedSession {
    return {
        sessionId: 'session-1234',
        title: 'Sample Session',
        createdAt: Date.UTC(2026, 4, 20, 0, 0, 0),
        filePath: 'sample.jsonl',
        turns: [
            {
                turnIndex: 1,
                timestamp: Date.UTC(2026, 4, 20, 0, 0, 0),
                requestId: 'request-1',
                userText: 'Hello',
                assistantText: 'Hi there',
                modelId: 'copilot/auto',
            },
        ],
    };
}

suite('Chat History Sync', () => {
    test('Commands should be registered after activation', async () => {
        const extension = vscode.extensions.getExtension('local-dev.chat-history-sync');
        assert.ok(extension, 'Expected the extension to be available in the test host');
        await extension!.activate();
        const commands = await vscode.commands.getCommands(true);
        assert.ok(
            commands.includes('chatHistorySync.saveNow'),
            'Expected chatHistorySync.saveNow to be registered'
        );
        assert.ok(
            commands.includes('chatHistorySync.toggleAutoSave'),
            'Expected chatHistorySync.toggleAutoSave to be registered'
        );
    });

    test('Default configuration values should be correct', () => {
        const cfg = vscode.workspace.getConfiguration('chatHistorySync');
        assert.strictEqual(cfg.get('enabled'), true);
        assert.strictEqual(cfg.get('outputPath'), '.chat-history');
        assert.strictEqual(cfg.get('format'), 'md');
        assert.strictEqual(cfg.get('retention'), 'full');
    });

    test('Both format should write Markdown and JSON files', async () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chat-history-sync-'));
        try {
            const session = createSampleSession();
            const writtenFiles = await exportSession(
                session,
                vscode.Uri.file(tempDir),
                'history/subdir',
                'both',
                'full',
            );

            assert.strictEqual(writtenFiles.length, 2);
            assert.ok(writtenFiles.every(uri => uri.fsPath.includes(path.join('history', 'subdir'))));

            const fileNames = writtenFiles.map(uri => path.basename(uri.fsPath)).sort();
            assert.deepStrictEqual(fileNames, [
                '2026-05-20-Sample-Session-sion1234.json',
                '2026-05-20-Sample-Session-sion1234.md',
            ]);

            for (const fileUri of writtenFiles) {
                assert.ok(fs.existsSync(fileUri.fsPath), `Expected file to exist: ${fileUri.fsPath}`);
            }
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('Output path traversal should be rejected', () => {
        assert.throws(
            () => resolveOutputPath('../escape'),
            /must not escape the workspace root/i,
        );
    });
});
