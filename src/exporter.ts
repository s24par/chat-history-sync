import * as vscode from 'vscode';
import { ParsedSession } from './parser';

export type OutputFormat = 'md' | 'json' | 'both';

// ---------- Helpers ----------

function sanitizeFileName(name: string): string {
    return name
        .replace(/[/\\?%*:|"<>\r\n]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80);
}

function toIso(ts: number): string {
    return new Date(ts).toISOString();
}

function datePart(ts: number): string {
    return new Date(ts).toISOString().substring(0, 10);
}

function sessionSuffix(sessionId: string): string {
    const compact = sessionId.replace(/[^a-zA-Z0-9]/g, '');
    const suffix = compact.slice(-8);
    return suffix || 'session';
}

// ---------- Markdown builder ----------

function buildMarkdown(session: ParsedSession, retention: 'full' | 'output-only'): string {
    const lines: string[] = [
        `# ${session.title}`,
        '',
        `**Session ID:** \`${session.sessionId}\``,
        `**Created:** ${toIso(session.createdAt)}`,
        '',
        '---',
        '',
    ];

    for (const turn of session.turns) {
        lines.push(`## Turn ${turn.turnIndex}`);
        lines.push('');

        if (retention === 'full' && turn.userText) {
            lines.push('**User**');
            lines.push('');
            lines.push(turn.userText);
            lines.push('');
        }

        lines.push('**Copilot**');
        if (turn.modelId) {
            lines.push(`*Model: ${turn.modelId}*`);
        }
        lines.push('');
        lines.push(turn.assistantText || '*(no response text)*');
        lines.push('');
        lines.push('---');
        lines.push('');
    }

    return lines.join('\n');
}

// ---------- JSON builder ----------

function buildJson(session: ParsedSession, retention: 'full' | 'output-only'): string {
    const output = {
        sessionId: session.sessionId,
        title: session.title,
        createdAt: toIso(session.createdAt),
        turns: session.turns.map(t => {
            const turn: Record<string, unknown> = {
                turn: t.turnIndex,
                timestamp: toIso(t.timestamp),
                modelId: t.modelId,
                assistant: t.assistantText,
            };
            if (retention === 'full') {
                turn.user = t.userText;
            }
            return turn;
        }),
    };
    return JSON.stringify(output, null, 2);
}

// ---------- Public API ----------

async function writeSessionFile(
    session: ParsedSession,
    outputDir: vscode.Uri,
    format: Exclude<OutputFormat, 'both'>,
    retention: 'full' | 'output-only',
): Promise<vscode.Uri> {
    const safeName = sanitizeFileName(session.title);
    const stamp = datePart(session.createdAt);
    const idSuffix = sessionSuffix(session.sessionId);
    const fileName = `${stamp}-${safeName}-${idSuffix}.${format}`;
    const fileUri = vscode.Uri.joinPath(outputDir, fileName);

    const content = format === 'md'
        ? buildMarkdown(session, retention)
        : buildJson(session, retention);

    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf-8'));
    return fileUri;
}

/**
 * Serializes a parsed session to the configured format and writes it to the
 * workspace output directory. Returns the URI of the written file.
 */
export async function exportSession(
    session: ParsedSession,
    workspaceRoot: vscode.Uri,
    outputPath: string,
    format: OutputFormat,
    retention: 'full' | 'output-only',
): Promise<vscode.Uri[]> {
    const outputDir = vscode.Uri.joinPath(workspaceRoot, outputPath);
    await vscode.workspace.fs.createDirectory(outputDir);

    const formats: Exclude<OutputFormat, 'both'>[] = format === 'both' ? ['md', 'json'] : [format];
    const writtenFiles: vscode.Uri[] = [];

    for (const currentFormat of formats) {
        writtenFiles.push(await writeSessionFile(session, outputDir, currentFormat, retention));
    }

    return writtenFiles;
}
