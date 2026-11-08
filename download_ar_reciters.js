import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.join(process.cwd(), 'public', 'reciters');

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'FaizAppBot/1.0 (https://faizapp.org; contact@faizapp.org)',
      ...headers,
    };
    https.get(url, { headers: defaultHeaders }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return fetchUrl(redirectUrl, headers).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function getArabicWikiThumb(title) {
  const url = `https://ar.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=500&format=json`;
  const buf = await fetchUrl(url);
  const data = JSON.parse(buf.toString('utf8'));
  const page = Object.values(data.query.pages)[0];
  if (page && page.thumbnail) {
    return page.thumbnail.source;
  }
  return null;
}

async function run() {
  const targets = [
    { id: 'ar.mahermuaiqly', title: 'ماهر المعيقلي' },
    { id: 'ar.abdulbasitmurattal', title: 'عبد الباسط عبد الصمد' },
  ];

  for (const t of targets) {
    console.log(`Searching ar.wiki for ${t.title}...`);
    const thumbUrl = await getArabicWikiThumb(t.title);
    console.log(`Found:`, thumbUrl);
    if (thumbUrl) {
      const img = await fetchUrl(thumbUrl);
      const dest = path.join(outDir, `${t.id}.jpg`);
      fs.writeFileSync(dest, img);
      console.log(`Saved ${dest} (${img.length} bytes)`);
    }
  }
}

run();
