// scripts/update-featured.js
// Auto-update the "Featured Projects" block of README.md from real public repos.
// Zero dependencies: uses Node's built-in https module (same style as update-quote.js).
//
// Replaces only the content between the markers:
//   <!--STARTS_HERE_FEATURED--> ... <!--ENDS_HERE_FEATURED-->
// The rest of README.md is untouched. Exits 0 with "no change" if identical.
//
// Cards use shields.io badges (reliable) instead of the flaky github-readme-stats Vercel app.
//
// Env: GITHUB_TOKEN (optional but avoids rate limits). Runs in GitHub Actions daily.

const https = require("https");
const fs = require("fs");

const USER = "vinothhacks";
const TOP_N = 6;
const TOKEN = process.env.GITHUB_TOKEN || "";

// Repos to never auto-feature (profile/config/sandbox).
const EXCLUDE = new Set(["vinothhacks", "Web-Development", "mcp-sandbox-2605"]);

// Optional: force-include repos by name (e.g. a private repo you want highlighted).
// Pinned private repos render with a "private" badge.
const PIN = [];

function api(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "api.github.com",
      path,
      headers: {
        "User-Agent": "vinothhacks-profile-bot",
        Accept: "application/vnd.github+json",
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    };
    https.get(opts, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`GitHub API ${res.statusCode}: ${body.slice(0, 200)}`));
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function escapeHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Reliable badge cluster (shields.io) — no dependency on the flaky github-readme-stats Vercel app.
function badges(repo) {
  if (repo.private) {
    return `<img alt="private" src="https://img.shields.io/badge/repo-private-6e7681?style=flat&logo=github" />`;
  }
  const u = USER;
  const n = repo.name;
  return [
    `<img src="https://img.shields.io/github/stars/${u}/${n}?style=flat&color=f1c40f&logo=github" alt="stars" />`,
    `<img src="https://img.shields.io/github/forks/${u}/${n}?style=flat&color=58a6ff&logo=github" alt="forks" />`,
    `<img src="https://img.shields.io/github/languages/top/${u}/${n}?style=flat&color=1f6feb" alt="language" />`,
    `<img src="https://img.shields.io/github/last-commit/${u}/${n}?style=flat&color=6e7681" alt="last commit" />`,
  ].join("&nbsp;");
}

function renderTable(items) {
  // items: array of {repo, pinned}
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const cells = [];
    for (let j = 0; j < 2; j++) {
      const it = items[i + j];
      if (!it) {
        cells.push('<p align="center"><i>More shipping soon — MCP automation, ML notebooks, side projects.</i></p>');
        continue;
      }
      const r = it.repo;
      const url = `https://github.com/${USER}/${r.name}`;
      const desc = escapeHtml(r.description || "");
      cells.push(`<p><a href="${url}"><b>${escapeHtml(r.name)}</b></a><br/><sub>${badges(r)}</sub></p><p>${desc}</p>`);
    }
    rows.push(`  <tr>\n    <td width="50%" valign="top">\n      ${cells[0]}\n    </td>\n    <td width="50%" valign="top">\n      ${cells[1]}\n    </td>\n  </tr>`);
  }
  return `<table width="100%">\n${rows.join("\n")}\n</table>`;
}

(async () => {
  try {
    const all = await api(`/users/${USER}/repos?per_page=100&sort=updated&type=all`);

    // Pinned first (by name, from PIN list; may be private).
    const pinned = PIN.map((name) => all.find((r) => r.name === name)).filter(Boolean);

    // Eligible public repos for auto-pick.
    const eligible = all.filter(
      (r) => !r.private && !r.fork && !r.archived && !EXCLUDE.has(r.name) && !PIN.includes(r.name)
    );

    const now = Date.now();
    const scored = eligible
      .map((r) => {
        const days = (now - new Date(r.updated_at)) / 86400000;
        const recency = Math.max(0, 365 - days);
        return { r, score: (r.stargazers_count || 0) * 5 + recency };
      })
      .sort((a, b) => b.score - a.score);

    const rest = scored.slice(0, Math.max(0, TOP_N - pinned.length)).map((s) => s.r);
    const items = [...pinned.map((r) => ({ repo: r, pinned: true })), ...rest.map((r) => ({ repo: r, pinned: false }))];

    const table = renderTable(items);

    const readmePath = "README.md";
    let readme = fs.readFileSync(readmePath, "utf8");
    const start = "<!--STARTS_HERE_FEATURED-->";
    const end = "<!--ENDS_HERE_FEATURED-->";
    const startIdx = readme.indexOf(start);
    const endIdx = readme.indexOf(end);
    if (startIdx < 0 || endIdx < 0) {
      console.error("Markers not found in README.md");
      process.exit(1);
    }
    const block = `${start}\n${table}\n${end}`;
    const next = readme.slice(0, startIdx) + block + readme.slice(endIdx + end.length);

    if (next === readme) {
      console.log("No changes — featured projects already up to date.");
      process.exit(0);
    }
    fs.writeFileSync(readmePath, next);
    console.log(`Updated Featured Projects: ${items.map((i) => i.repo.name).join(", ")}`);
  } catch (e) {
    console.error("update-featured failed:", e.message);
    process.exit(1);
  }
})();
