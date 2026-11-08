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
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=Abdul%20Basit%20Abd%20us-Samad&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json`;
  const buf = await fetchUrl(url);
  const data = JSON.parse(buf.toString('utf8'));
  console.log('Commons search results:');
  for (const page of Object.values(data.query.pages)) {
    console.log(page.title, page.imageinfo?.[0]?.thumburl);
    if (page.imageinfo?.[0]?.thumburl) {
      const img = await fetchUrl(page.imageinfo[0].thumburl);
      const dest = path.join(outDir, 'ar.abdulbasitmurattal.jpg');
      fs.writeFileSync(dest, img);
      console.log(`Saved Abdul Basit to ${dest} (${img.length} bytes)`);
      break;
    }
  }
}
run();
