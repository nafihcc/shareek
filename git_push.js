import fs from "fs";
import http from "isomorphic-git/http/node";
import git from "isomorphic-git";

const repoUrl = process.argv[2];
const token = process.argv[3];

if (!repoUrl || !token) {
  console.log("Usage: node git_push.js <repo-url> <personal-access-token>");
  process.exit(1);
}

async function run() {
  console.log(`Setting remote origin to ${repoUrl}...`);
  await git.addRemote({
    fs,
    dir: process.cwd(),
    remote: "origin",
    url: repoUrl,
    force: true,
  });

  console.log("Pushing to main branch...");
  const res = await git.push({
    fs,
    http,
    dir: process.cwd(),
    remote: "origin",
    ref: "main",
    onAuth: () => ({ username: token }),
  });

  console.log("Push succeeded!", res);
}

run().catch((err) => {
  console.error("Push failed:", err.message);
  process.exit(1);
});
