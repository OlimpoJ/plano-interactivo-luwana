const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('public/LUWANA GENERAL.svg');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const ids = new Set();
  for await (const line of rl) {
    const match = line.match(/id=\"([^\"]+)\"/);
    if (match) {
        const id = match[1];
        if (/ZONA|ETAPA|PARTE/i.test(id)) {
            ids.add(id);
        }
    }
  }
  console.log(Array.from(ids).join(', '));
}
processLineByLine();
