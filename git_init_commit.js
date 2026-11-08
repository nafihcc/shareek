import fs from "fs";
import path from "path";
import git from "isomorphic-git";

const dir = process.cwd();

async function initAndCommit() {
  console.log("Initializing git repo at", dir);
  await git.init({ fs, dir });

  // Add all files except node_modules and .system_generated
  const filesToIgnore = new Set(["node_modules", ".git"]);
  
  async function getAllFiles(currentDir, relativePath = "") {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (filesToIgnore.has(entry.name)) continue;
      const full = path.join(currentDir, entry.name);
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files = files.concat(await getAllFiles(full, rel));
      } else {
        files.push(rel);
      }
    }
    return files;
  }

  const allFiles = await getAllFiles(dir);
  console.log(`Found ${allFiles.length} files to track.`);

  for (const f of allFiles) {
    await git.add({ fs, dir, filepath: f });
  }

  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: "Faiz Assistant",
      email: "assistant@faizapp.org",
    },
    message: "Awwwards-winning enhancements: 60fps animations, master reciter portraits, and calendar PDF export",
  });

  console.log("Created commit:", sha);
}

initAndCommit().catch((err) => console.error("Error in git:", err));
