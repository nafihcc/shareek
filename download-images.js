import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const RECITERS = [
  { id: "ar.alafasy", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Mishary_Al-Afasy.jpg/440px-Mishary_Al-Afasy.jpg" },
  { id: "ar.abdurrahmaansudais", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Abdul_Rahman_Al-Sudais.png/440px-Abdul_Rahman_Al-Sudais.png" },
  { id: "ar.saoodshuraym", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Saud_Al-Shuraim_1.jpg/440px-Saud_Al-Shuraim_1.jpg" },
  { id: "ar.mahermuaiqly", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Maher_al-Muaiqly.jpg/440px-Maher_al-Muaiqly.jpg" },
  { id: "ar.husary", url: "https://upload.wikimedia.org/wikipedia/ar/b/b3/Mahmoud_Khalil_Al-Hussary.jpg" },
  { id: "ar.minshawi", url: "https://upload.wikimedia.org/wikipedia/ar/2/22/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D8%AF%D9%8A%D9%82_%D8%A7%D9%84%D9%85%D9%86%D8%B4%D8%A7%D9%88%D9%8A.jpg" },
  { id: "ar.abdulbasitmurattal", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Abdul_Basit_Abdus_Samad.jpg/440px-Abdul_Basit_Abdus_Samad.jpg" },
  { id: "ar.ahmedajamy", url: "https://archive.org/download/Ahmed_Al_Ajmi_201601/Ahmed_Al_Ajmi.jpg" }
];

const dir = path.join(process.cwd(), "public", "reciters");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

for (const r of RECITERS) {
  const p = path.join(dir, `${r.id}.jpg`);
  try {
    console.log(`Downloading ${r.id}...`);
    execSync(`curl -L -o "${p}" "${r.url}"`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`Failed to download ${r.id}: ${e.message}`);
  }
}
