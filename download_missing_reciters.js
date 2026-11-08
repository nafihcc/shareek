import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.join(process.cwd(), 'public', 'reciters');

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

async function searchWikipediaImage(searchQuery) {
  try {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=3&prop=pageimages&pithumbsize=500&format=json`;
    const buffer = await fetchUrl(apiUrl, { 'User-Agent': 'FaizQuranApp/1.0 (contact@faizapp.org)' });
    const data = JSON.parse(buffer.toString('utf8'));
    if (data.query && data.query.pages) {
      for (const page of Object.values(data.query.pages)) {
        if (page.thumbnail && page.thumbnail.source) {
          console.log(`Found page ${page.title}: ${page.thumbnail.source}`);
          return page.thumbnail.source;
        }
      }
    }
  } catch (err) {
    console.error(`Search failed for ${searchQuery}:`, err.message);
  }
  return null;
}

async function run() {
  const missing = [
    { id: 'ar.mahermuaiqly', queries: ['Maher Al-Muaiqly', 'Maher Al Mueaqly', 'ماهر المعيقلي'] },
    { id: 'ar.abdulbasitmurattal', queries: ['Abdul Basit Abd us-Samad', 'Abdul Basit', 'عبد الباسط عبد الصمد'] },
  ];

  for (const item of missing) {
    let imgBuffer = null;
    for (const q of item.queries) {
      console.log(`Trying query: ${q}`);
      const url = await searchWikipediaImage(q);
      if (url) {
        try {
          const buf = await fetchUrl(url, { 'User-Agent': 'FaizQuranApp/1.0 (contact@faizapp.org)' });
          if (buf.length > 3000) {
            imgBuffer = buf;
            console.log(`✓ Downloaded ${item.id} (${buf.length} bytes)`);
            break;
          }
        } catch (e) {
          console.log('Error downloading:', e.message);
        }
      }
    }
    if (imgBuffer) {
      const dest = path.join(outDir, `${item.id}.jpg`);
      fs.writeFileSync(dest, imgBuffer);
      console.log(`Saved ${dest}`);
    } else {
      console.log(`Still failed for ${item.id}`);
    }
  }
}

run();
