import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Chat History Sync', () => {
    test('Commands should be registered after activation', async () => {
        // Allow extension host time to finish activating
        await new Promise<void>(resolve => setTimeout(resolve, 500));
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
});
