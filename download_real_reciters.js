import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.join(process.cwd(), 'public', 'reciters');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1&prop=pageimages&pithumbsize=500&format=json`;
    const buffer = await fetchUrl(apiUrl, { 'User-Agent': 'FaizQuranApp/1.0 (contact@faizapp.org)' });
    const data = JSON.parse(buffer.toString('utf8'));
    if (data.query && data.query.pages) {
      const page = Object.values(data.query.pages)[0];
      if (page && page.thumbnail && page.thumbnail.source) {
        return page.thumbnail.source;
      }
    }
  } catch (err) {
    console.error(`Search failed for ${searchQuery}:`, err.message);
  }
  return null;
}

const reciters = [
  { id: 'ar.alafasy', query: 'Mishary Rashid Alafasy', direct: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Mishary_Al-Afasy.jpg' },
  { id: 'ar.abdurrahmaansudais', query: 'Abdul-Rahman Al-Sudais', direct: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Abdul_Rahman_Al-Sudais.png' },
  { id: 'ar.saoodshuraym', query: 'Saud Al-Shuraim', direct: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Saud_Shuraim_doing_the_Khutbah.png' },
  { id: 'ar.mahermuaiqly', query: 'Maher Al Mueaqly', direct: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Maher_al-Muaiqly.jpg' },
  { id: 'ar.husary', query: 'Mahmoud Khalil Al-Hussary', direct: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Hussary.jpg' },
  { id: 'ar.minshawi', query: 'Mohamed Siddiq El-Minshawi', direct: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mohamed_Siddiq_El-Minshawi.jpg' },
  { id: 'ar.abdulbasitmurattal', query: 'Abdul Basit Abd us-Samad', direct: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Abdul_Basit_Abdus_Samad.jpg' },
  { id: 'ar.ahmedajamy', query: 'Ahmed Al-Ajmi reciter', direct: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Ahmed_Ali_Al-Ajmi.jpg' },
];

async function run() {
  for (const r of reciters) {
    console.log(`Processing ${r.id}...`);
    let imgBuffer = null;
    
    // First try direct URL
    if (r.direct) {
      try {
        const buf = await fetchUrl(r.direct);
        if (buf.length > 5000 && !buf.slice(0, 100).toString().includes('<!DOCTYPE')) {
          imgBuffer = buf;
          console.log(`✓ Direct success for ${r.id} (${buf.length} bytes)`);
        }
      } catch (e) {
        console.log(`Direct failed for ${r.id}: ${e.message}`);
      }
    }

    // Fallback to Wikipedia search API
    if (!imgBuffer) {
      const foundUrl = await searchWikipediaImage(r.query);
      if (foundUrl) {
        try {
          const buf = await fetchUrl(foundUrl, { 'User-Agent': 'FaizQuranApp/1.0 (contact@faizapp.org)' });
          if (buf.length > 3000) {
            imgBuffer = buf;
            console.log(`✓ Wiki search success for ${r.id} (${buf.length} bytes)`);
          }
        } catch (e) {
          console.log(`Wiki download failed: ${e.message}`);
        }
      }
    }

    if (imgBuffer) {
      const dest = path.join(outDir, `${r.id}.jpg`);
      fs.writeFileSync(dest, imgBuffer);
      console.log(`Saved ${dest}`);
    } else {
      console.log(`❌ Could not get image for ${r.id}`);
    }
  }
}

run();
