const fs = require('fs');
const readline = require('readline');

async function analyze() {
  const fileStream = fs.createReadStream('/home/sakuraif/.config/Code/User/workspaceStorage/19f729102b7c401055c54c6f1e9fc5c6/chatSessions/8e4417b2-85dc-4e92-8513-87d6054836a4.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const topLevelKeys = new Set();
  const vKeys = new Set();
  const requestKeys = new Set();
  const responsePartInfo = {}; 
  const otherFields = new Set();

  function processRequests(requests) {
    if (!requests || !Array.isArray(requests)) return;
    requests.forEach(req => {
      Object.keys(req).forEach(k => requestKeys.add(k));
      if (req.result) otherFields.add('request.result keys: ' + Object.keys(req.result).join(', '));
      if (req.metadata) otherFields.add('request.metadata keys: ' + Object.keys(req.metadata).join(', '));
      
      if (req.response && Array.isArray(req.response)) {
        req.response.forEach(part => {
          const kind = part.kind || 'unknown';
          if (!responsePartInfo[kind]) responsePartInfo[kind] = new Set();
          Object.keys(part).forEach(k => responsePartInfo[kind].add(k));
        });
      }
    });
  }

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      Object.keys(record).forEach(k => topLevelKeys.add(k));
      if (record.v) {
        if (typeof record.v === 'object' && !Array.isArray(record.v)) {
           Object.keys(record.v).forEach(k => vKeys.add(k));
           if (record.v.requests) processRequests(record.v.requests);
        }
      }
    } catch (e) {}
  }

  console.log('1) Top-level keys: ' + [...topLevelKeys].join(', '));
  console.log('2) Keys in record.v: ' + [...vKeys].join(', '));
  console.log('3) Keys in request objects: ' + [...requestKeys].join(', '));
  console.log('4) Response part kinds and keys:');
  for (const [kind, keys] of Object.entries(responsePartInfo)) {
    console.log(`  - ${kind}: ${[...keys].join(', ')}`);
  }
  console.log('5) Notable fields:');
  [...otherFields].forEach(f => console.log(`  - ${f}`));
}

analyze();
