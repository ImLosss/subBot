const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'database', 'training', 'important');
const files = fs.readdirSync(folder).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const data = require(path.join(folder, file));
  const seen = new Set();
  const dupe = [];

  if (Array.isArray(data.REPLACE_THIS)) {
    data.REPLACE_THIS.forEach(item => {
      if (seen.has(item.mandarin)) dupe.push(item.mandarin);
      else seen.add(item.mandarin);
    });
  }

  if (dupe.length) {
    console.log(`Duplikat di file ${file}:`, dupe);
  } else console.log(`Tidak ada duplikat di file ${file}.`);
});