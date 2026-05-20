import * as fs from 'fs';
import * as path from 'path';

// ---------- Public types ----------

export interface SessionTurn {
    turnIndex: number;
    timestamp: number;
    requestId: string;
    userText: string;
    assistantText: string;
    modelId: string;
}

export interface ParsedSession {
    sessionId: string;
    title: string;
    createdAt: number;
    turns: SessionTurn[];
    filePath: string;
}

// ---------- Internal raw types ----------

interface RawResponsePart {
    kind?: string;
    value?: unknown;
}

interface RawRequest {
    requestId?: string;
    timestamp?: number;
    modelId?: string;
    // User prompt text is stored at message.text
    message?: { text?: string };
    response?: RawResponsePart[];
}

interface RawSessionState {
    sessionId?: string;
    customTitle?: string;
    creationDate?: number;
    requests?: RawRequest[];
}

// ---------- JSONL reconstruction ----------

/**
 * Applies a kind:1 or kind:2 patch (deep key-path set) to the given state object.
 * k is a path like ["requests", 0, "completionTokens"].
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyPatch(state: Record<string, unknown>, keyPath: (string | number)[], value: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = state;
    for (let i = 0; i < keyPath.length - 1; i++) {
        if (obj === null || typeof obj !== 'object') { return; }
        obj = obj[keyPath[i]];
    }
    if (obj !== null && typeof obj === 'object') {
        obj[keyPath[keyPath.length - 1]] = value;
    }
}

// ---------- Response text extraction ----------

/**
 * Extracts plain Markdown text from a response parts array.
 * Text parts are those without a `kind` field whose `value` is a non-empty string.
 */
function extractAssistantText(parts: RawResponsePart[]): string {
    const chunks: string[] = [];

    for (const part of parts) {
        if (!part || typeof part !== 'object') {
            continue;
        }

        if (!part.kind && typeof part.value === 'string') {
            chunks.push(part.value as string);
            continue;
        }

        if (part.kind === 'inlineReference') {
            const ref = (part as unknown as {
                name?: string;
                inlineReference?: { name?: string; path?: string };
            });

            const label = ref.name
                ?? ref.inlineReference?.name
                ?? ref.inlineReference?.path
                ?? '';

            if (label) {
                chunks.push(label);
            }
        }
    }

    return chunks.join('');
}

// ---------- Public API ----------

/**
 * Reads and parses a chatSessions JSONL file.
 *
 * The format uses:
 *  - kind:0 – full session state snapshot
 *  - kind:1 – set value at key path
 *  - kind:2 – replace value at key path (treated identically to kind:1)
 *
 * We replay the JSONL stream in order and keep the latest session snapshot,
 * while accumulating request snapshots so the full turn history is preserved.
 */
export function parseSession(filePath: string): ParsedSession | null {
    let content: string;
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch {
        return null;
    }

    const lines = content.split('\n').filter(l => l.trim().length > 0);
    let baseState: RawSessionState = {};
    const requestMap = new Map<string, RawRequest>();
    const orderedRequestIds: string[] = [];
    const indexedRequests = new Map<number, RawRequest>();

    const mergeRequest = (previous: RawRequest | undefined, request: RawRequest): RawRequest => {
        if (!previous) {
            return request;
        }
        return {
            ...previous,
            ...request,
            message: request.message ?? previous.message,
            response: request.response ?? previous.response,
        };
    };

    const ensureIndexedRequest = (index: number): RawRequest => {
        const existing = indexedRequests.get(index);
        if (existing) {
            return existing;
        }
        const created: RawRequest = {};
        indexedRequests.set(index, created);
        return created;
    };

    const captureRequests = (requests: RawRequest[]): void => {
        for (const request of requests) {
            const key = request.requestId || `__request_${requestMap.size}`;
            const merged = mergeRequest(requestMap.get(key), request);

            if (!requestMap.has(key)) {
                orderedRequestIds.push(key);
            }
            requestMap.set(key, merged);
        }
    };

    // Reconstruct the session by replaying records in order.
    for (const line of lines) {
        try {
            const record = JSON.parse(line);
            if (record.kind === 0 && record.v) {
                baseState = record.v as RawSessionState;
                if (Array.isArray(baseState.requests)) {
                    captureRequests(baseState.requests);
                }
            } else if ((record.kind === 1 || record.kind === 2) && Array.isArray(record.k)) {
                applyPatch(baseState as Record<string, unknown>, record.k as (string | number)[], record.v);
                if (record.k.length === 1 && record.k[0] === 'requests' && Array.isArray(record.v)) {
                    captureRequests(record.v as RawRequest[]);
                } else if (record.k.length >= 2 && record.k[0] === 'requests' && typeof record.k[1] === 'number') {
                    const requestIndex = record.k[1];

                    if (record.k.length === 2 && record.v && typeof record.v === 'object') {
                        const merged = mergeRequest(indexedRequests.get(requestIndex), record.v as RawRequest);
                        indexedRequests.set(requestIndex, merged);
                        continue;
                    }

                    const requestState = ensureIndexedRequest(requestIndex);
                    applyPatch(
                        requestState as Record<string, unknown>,
                        record.k.slice(2) as (string | number)[],
                        record.v,
                    );
                }
            }
        } catch {
            // Skip malformed lines
        }
    }

    let requests: RawRequest[];

    if (indexedRequests.size > 0) {
        const usedKeys = new Set<string>();
        const mergedByIndex = Array.from(indexedRequests.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([index, request]) => {
                // Try to match by requestId first.
                const requestId = request.requestId;
                if (requestId && requestMap.has(requestId)) {
                    usedKeys.add(requestId);
                    return mergeRequest(requestMap.get(requestId), request);
                }

                // Fall back to positional match: use the request at the same 0-based
                // index in orderedRequestIds when the indexed patch carries no requestId.
                const positionalKey = orderedRequestIds[index];
                if (positionalKey && requestMap.has(positionalKey)) {
                    usedKeys.add(positionalKey);
                    return mergeRequest(requestMap.get(positionalKey), request);
                }

                return request;
            });

        const snapshotOnly = orderedRequestIds
            .filter(key => !usedKeys.has(key))
            .map(key => requestMap.get(key))
            .filter((request): request is RawRequest => Boolean(request));

        requests = [...mergedByIndex, ...snapshotOnly];
    } else if (requestMap.size > 0) {
        requests = orderedRequestIds
            .map(key => requestMap.get(key))
            .filter((request): request is RawRequest => Boolean(request));
    } else {
        requests = baseState.requests ?? [];
    }

    if (!baseState.sessionId && !baseState.customTitle && !baseState.creationDate && requests.length === 0) {
        return null;
    }

    const sessionId = baseState.sessionId ?? path.basename(filePath, '.jsonl');
    const title = (baseState.customTitle?.trim()) || sessionId;
    const createdAt = baseState.creationDate ?? Date.now();
    let turns: SessionTurn[] = requests.map((req, idx) => ({
        turnIndex: idx + 1,
        timestamp: req.timestamp ?? createdAt,
        requestId: req.requestId ?? '',
        userText: req.message?.text ?? '',
        assistantText: extractAssistantText(req.response ?? []),
        modelId: req.modelId ?? '',
    }));

    // Sort by timestamp to ensure correct order (fixes out-of-order turns from indexed patches)
    turns.sort((a, b) => a.timestamp - b.timestamp);

    // Re-assign turnIndex after sorting
    turns = turns.map((turn, idx) => ({
        ...turn,
        turnIndex: idx + 1,
    }));

    return { sessionId, title, createdAt, turns, filePath };
}
