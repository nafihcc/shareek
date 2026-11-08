import fs from 'fs';
import path from 'path';
import https from 'https';

const dest = path.join(process.cwd(), 'public', 'reciters', 'ar.abdulbasitmurattal.jpg');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FaizAppBot/1.0 (https://faizapp.org; contact@faizapp.org)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(dest, buf);
        resolve(buf.length);
      });
    }).on('error', reject);
  });
}

download('https://commons.wikimedia.org/wiki/Special:FilePath/Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg')
  .then(len => console.log('Downloaded Abdul Basit:', len))
  .catch(err => console.error('Error:', err.message));
