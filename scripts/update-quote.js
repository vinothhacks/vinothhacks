const fs = require('node:fs');
const path = require('node:path');

const README = path.join(process.cwd(), 'README.md');
const QUOTES = path.join(process.cwd(), 'scripts/quotes.json');

const quotes = JSON.parse(fs.readFileSync(QUOTES, 'utf8'));
const pick   = quotes[Math.floor(Math.random() * quotes.length)];

const block = [
  '<!--STARTS_HERE_QUOTE_CARD-->',
  '> ' + pick.text.replace(/\n/g, ' ') + ' --- *' + pick.author + '*',
  '<!--ENDS_HERE_QUOTE_CARD-->'
].join('\n');

const md      = fs.readFileSync(README, 'utf8');
const updated = md.replace(
  /<!--STARTS_HERE_QUOTE_CARD-->[\s\S]*?<!--ENDS_HERE_QUOTE_CARD-->/,
  block
);
fs.writeFileSync(README, updated);
