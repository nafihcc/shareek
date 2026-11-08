import fs from "fs";
import path from "path";
import https from "https";

const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Alafasy" },
  { id: "ar.abdurrahmaansudais", name: "Abdur-Rahman As-Sudais" },
  { id: "ar.saoodshuraym", name: "Saud Ash-Shuraim" },
  { id: "ar.mahermuaiqly", name: "Maher Al-Muaiqly" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
  { id: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit Abdus-Samad" },
  { id: "ar.ahmedajamy", name: "Ahmed Al-Ajamy" },
];

const initials = (name) => name.split(/[\s-]+/).filter((w) => !/^(al|as|ash|abdus|abdur)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("");

const dir = path.join(process.cwd(), "public", "reciters");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 FaizApp/1.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath)).on('finish', resolve);
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  for (const r of RECITERS) {
    const chars = initials(r.name);
    // Use an API that creates a nice face/avatar image, or ui-avatars.
    // ui-avatars generates a nice circular image with initials.
    // wait, we can just use ui-avatars to have a good placeholder that is a real image.
    const url = `https://ui-avatars.com/api/?name=${chars}&size=256&background=0D8ABC&color=fff`;
    const p = path.join(dir, `${r.id}.jpg`);
    try {
      await downloadImage(url, p);
      console.log(`Downloaded avatar for ${r.id}`);
    } catch(e) {
      console.log(`Failed downloading avatar for ${r.id}: ${e.message}`);
    }
  }
}
run();
