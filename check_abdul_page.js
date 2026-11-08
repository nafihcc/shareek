import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.join(process.cwd(), 'public', 'reciters');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FaizAppBot/1.0 (https://faizapp.org; contact@faizapp.org)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=Abdul_Basit_%27Abd_us-Samad&prop=images&format=json`;
  const buf = await fetchUrl(url);
  const data = JSON.parse(buf.toString('utf8'));
  console.log('Page images:', JSON.stringify(data, null, 2));
}
run();
