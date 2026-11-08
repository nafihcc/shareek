import fs from "fs";
import https from "https";
import http from "isomorphic-git/http/node";
import git from "isomorphic-git";

const token = process.argv[2];
const repoName = process.argv[3] || "deen-degrees-plus";

if (!token) {
  console.log("Usage: node create_and_deploy.js <github-personal-access-token> [repo-name]");
  process.exit(1);
}

function githubRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = https.request(
      {
        hostname: "api.github.com",
        path: endpoint,
        method,
        headers: {
          "User-Agent": "Faiz-Deployer",
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  console.log("1. Authenticating user with GitHub API...");
  const userRes = await githubRequest("GET", "/user");
  if (userRes.status !== 200) {
    throw new Error(`Authentication failed: ${userRes.data?.message || "Invalid token"}`);
  }
  const username = userRes.data.login;
  console.log(`✓ Authenticated as ${username}`);

  console.log(`2. Creating new repository "${repoName}"...`);
  const createRes = await githubRequest("POST", "/user/repos", {
    name: repoName,
    description: "Faiz (Deen Degrees) · Awwwards-level Islamic Companion with 60fps animations, master reciter portraits & calendar PDF export",
    private: false,
    has_issues: true,
    has_projects: false,
    has_wiki: false,
  });

  let repoUrl = "";
  if (createRes.status === 201) {
    console.log(`✓ Repository created: https://github.com/${username}/${repoName}`);
    repoUrl = createRes.data.clone_url;
  } else if (createRes.status === 422) {
    console.log(`ℹ Repository "${repoName}" already exists, using existing.`);
    repoUrl = `https://github.com/${username}/${repoName}.git`;
  } else {
    throw new Error(`Failed to create repository: ${JSON.stringify(createRes.data)}`);
  }

  console.log("3. Pushing code to GitHub...");
  const dir = process.cwd();

  // Create main branch from current branch if it doesn't exist
  try {
    await git.branch({
      fs,
      dir,
      ref: "main",
      checkout: true,
    });
  } catch (e) {
    // Already exists or checkout
  }

  const authedUrl = `https://${token}@github.com/${username}/${repoName}.git`;
  await git.addRemote({
    fs,
    dir,
    remote: "origin",
    url: authedUrl,
    force: true,
  });

  console.log("Connecting and uploading to GitHub main branch...");
  const pushRes = await git.push({
    fs,
    http,
    dir,
    remote: "origin",
    ref: "main",
    remoteRef: "main",
    force: true,
    onAuth: () => ({ username: token, password: "" }),
  });
  console.log("✓ Code successfully pushed to main branch!", pushRes);

  console.log("4. Enabling GitHub Pages on the repository...");
  // Set GitHub Pages source to GitHub Actions
  const pagesRes = await githubRequest("POST", `/repos/${username}/${repoName}/pages`, {
    build_type: "workflow",
  });
  if (pagesRes.status === 201 || pagesRes.status === 409) {
    console.log(`✓ GitHub Pages configured!`);
  }

  const liveUrl = `https://${username}.github.io/${repoName}/`;
  console.log("\n==========================================");
  console.log(`🎉 DEPLOYMENT COMPLETE!`);
  console.log(`Repository: https://github.com/${username}/${repoName}`);
  console.log(`Live Pages: ${liveUrl}`);
  console.log("==========================================\n");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
