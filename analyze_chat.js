const fs = require('fs');
const readline = require('readline');

async function analyze() {
  const fileStream = fs.createReadStream('/home/sakuraif/.config/Code/User/workspaceStorage/19f729102b7c401055c54c6f1e9fc5c6/chatSessions/8e4417b2-85dc-4e92-8513-87d6054836a4.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const topLevelKeys = new Set();
  const vKeys = new Set();
  const requestKeys = new Set();
  const responsePartInfo = {}; // kind -> Set of keys
  const otherFields = new Set();

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      Object.keys(record).forEach(k => topLevelKeys.add(k));

      if (record.v && typeof record.v === 'object' && !Array.isArray(record.v)) {
        Object.keys(record.v).forEach(k => vKeys.add(k));
        
        // Analyze requests
        if (record.v.requests && Array.isArray(record.v.requests)) {
          record.v.requests.forEach(req => {
            Object.keys(req).forEach(k => requestKeys.add(k));
            if (req.result) otherFields.add('request.result: ' + Object.keys(req.result).join(', '));
            if (req.metadata) otherFields.add('request.metadata: ' + Object.keys(req.metadata).join(', '));
            
            // Analyze response parts
            if (req.response && Array.isArray(req.response)) {
              req.response.forEach(part => {
                const kind = part.kind || 'unknown';
                if (!responsePartInfo[kind]) responsePartInfo[kind] = new Set();
                Object.keys(part).forEach(k => responsePartInfo[kind].add(k));
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('Error parsing line', e);
    }
  }

  process.stdout.write('1) Top-level keys: ' + Array.from(topLevelKeys).join(', ') + '\n');
  process.stdout.write('2) Keys in record.v: ' + Array.from(vKeys).join(', ') + '\n');
  process.stdout.write('3) Keys in request objects: ' + Array.from(requestKeys).join(', ') + '\n');
  process.stdout.write('4) Response part kinds and keys:\n');
  for (const [kind, keys] of Object.entries(responsePartInfo)) {
    process.stdout.write(`  - ${kind}: ${Array.from(keys).join(', ')}\n`);
  }
  process.stdout.write('5) Notable fields (request.result/metadata):\n');
  Array.from(otherFields).forEach(f => process.stdout.write(`  - ${f}\n`));
}

analyze();
