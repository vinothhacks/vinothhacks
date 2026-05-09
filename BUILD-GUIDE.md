---
name: profile-readme
description: Build a polished GitHub profile README at `<username>/<username>` (Kiran1689-style) using GitHub MCP for shipping, llm-mcp (ChatGPT + Claude) for drafting, and LinkedIn MCP for cross-posting. Includes ready-to-paste widget snippets, exact MCP tool-call JSON, two GitHub Actions workflows (snake graph + daily quote), prompt templates for parallel LLM drafting, and a pitfalls checklist.
when_to_use:
  - You want a banner / typing intro / stats trio / trophies / snake graph profile (like Kiran1689/kiran1689).
  - You're starting a new "username/username" repo and want it shipped end-to-end through MCP.
  - You already have the repo and want to add the missing widgets / workflows / cross-posting layer.
  - User says "build me a profile readme", "kiran-style readme", "showcase repo", or "set up <my>/<my>".
---

# Profile README Playbook (MCP-driven)

A reusable, MCP-native recipe for shipping a Kiran1689-grade GitHub profile README in one session.

## What you'll ship

A public repo at `github.com/<owner>/<owner>` whose `README.md` GitHub auto-renders on the user's profile page. Sections: hero banner, typing intro, profile-views badge, About-me YAML, tech stack via skillicons, featured-projects card grid, GitHub stats / streak / top-langs / trophies / activity-graph trio-plus-one, blog-posts auto-list, daily-quote auto-update, contribution snake animation, social-row badges, capsule-render footer.

## Stack used

| Layer | Tool | What it does |
|---|---|---|
| Drafting | `user-llm-mcp` (ChatGPT + Claude in parallel) | Produce copy variants per section; pick the better one |
| Shipping | `user-github` MCP | `create_repository`, `push_files`, `create_or_update_file`, `get_file_contents` |
| Renderers (no auth) | capsule-render.vercel.app, github-readme-stats, github-readme-streak-stats, github-profile-trophy, skillicons.dev, readme-typing-svg.demolab.com, komarev.com/ghpvc, github-readme-activity-graph | Live SVGs that render on github.com |
| Automation | GitHub Actions | Daily quote (`schedule: cron: '0 0 * * *'`), contribution snake (`Platane/snk@v3`), latest-blog-posts (`gautamkrishnar/blog-post-workflow@v1`) |
| Distribution | `user-linkedin` MCP | Auto-DM project links via `send_message`, request connections via `connect_with_person` |

## Pre-conditions (fail fast if any are missing)

1. `user-github` MCP is connected. Run `github.get_me` and capture `login` as `<owner>`.
2. The repo `<owner>/<owner>` does NOT already exist (or you are okay overwriting). Check with `github.search_repositories query="user:<owner> <owner>"`.
3. `user-llm-mcp` `health` returns `chatgpt_logged_in_hint:true` AND `claude_logged_in_hint:true`. If either is false: follow the import-session flow in the llm-mcp README.
4. The repo MUST be **public** for the profile-special render to work. Set `private:false` on `create_repository`.

## Recipe (run in this order)

### Step 1 -- Resolve owner

```jsonc
// Tool: github.get_me  Args: {}
// Returns: { login: "<owner>", ... }  -- save <owner>
```

### Step 2 -- Draft each section in parallel (10x productivity move)

Fire **one ChatGPT chat AND one Claude chat at the same time with the identical brief**, then pick the better output per section.

```jsonc
// Tool: llm-mcp.chatgpt_new_chat
// Args: { "title": "profile-readme draft (chatgpt)", "model": "gpt-5-thinking" }

// Tool: llm-mcp.claude_new_chat
// Args: { "title": "profile-readme draft (claude)" }
```

Then for each section, send the same prompt to both via `chatgpt_send` and `claude_send`.

#### Prompt templates (copy-paste; fill `<owner>`, `<linkedin-handle>`, `<bio>`)

**Hero banner + typing intro:**

```text
You are co-authoring a Kiran1689-style GitHub profile README for `<owner>`.
Output ONLY a markdown block (raw HTML allowed) for the HERO BANNER + TYPING INTRO.
- Banner via capsule-render.vercel.app, type=waving, height 180, blue-on-dark gradient (0d1117 -> 1f6feb), heading = `<owner>` display name, subtitle = a 60-char positioning line.
- Typing SVG via readme-typing-svg.demolab.com, Fira Code 22pt 600 weight, 4 rotating lines: who-i-am / what-i-ship / how-i-ship / current-curiosity. URL-encode the lines.
Output: just the markdown. No commentary, no fences around the whole block.
```

**About-me YAML + tech stack:**

```text
Output ONLY markdown for ABOUT-ME (a YAML fenced block, 6 keys: name, role, location, focus[list], currently, learning) followed by TECH STACK (three skillicons.dev rows: frontend/backend, data/devops, ml/cloud).
For `<owner>` whose bio is: "<bio>".
Constraint: skillicons.dev `?i=` lists must be lowercase slugs only and `&perline=11`.
```

**Featured projects (4-card grid):**

```text
Output ONLY markdown for a 2x2 table of pinned-style cards via github-readme-stats `/api/pin/?username=<owner>&repo=<repo>&theme=tokyonight&hide_border=true`.
For these 4 repos: <repo1>, <repo2>, <repo3>, <repo4>. If fewer than 4, leave a "More coming soon" placeholder cell.
```

**GitHub stats trio + activity graph:**

```text
Output ONLY markdown: a 2-column table -- left cell = github-readme-stats `/api?username=<owner>&show_icons=true&count_private=true&include_all_commits=true&theme=tokyonight&hide_border=true&rank_icon=github`, right cell = streak-stats.demolab.com `/?user=<owner>&theme=tokyonight&hide_border=true`.
Below the table, full-width: top-langs `?username=<owner>&layout=compact&langs_count=10&theme=tokyonight&hide_border=true`, then trophies `?username=<owner>&theme=tokyonight&no-frame=true&row=1&column=7&margin-w=10`, then github-readme-activity-graph `?username=<owner>&bg_color=1a1b27&color=70a5fd&line=bf91f3&point=38bdae&area=true&hide_border=true`.
```

**Connect row + footer:**

```text
Output ONLY markdown for a centered row of shields.io for-the-badge style buttons:
GitHub (`https://github.com/<owner>` -- `181717`),
LinkedIn (`https://www.linkedin.com/in/<linkedin-handle>` -- `0A66C2`),
Email (`mailto:...` -- `D14836`).
Then a capsule-render `type=waving height=80 section=footer` reverse-gradient (1f6feb -> 0d1117).
```

#### Picking the better output

For each section, eyeball both replies; pick the one with (a) tighter URL parameters, (b) less filler prose, (c) consistent theme.

### Step 3 -- Assemble the README locally

Concatenate the picked sections with `---` dividers in the order: hero -> typing -> profile-views -> about -> tech -> projects -> stats trio -> activity graph -> blog posts (with `<!-- BLOG-POST-LIST:START --> <!-- BLOG-POST-LIST:END -->` markers) -> daily quote (with `<!--STARTS_HERE_QUOTE_CARD-->` markers) -> snake (`![snake](https://raw.githubusercontent.com/<owner>/<owner>/output/github-snake.svg)`) -> connect -> footer.

### Step 4 -- Create the repo

```jsonc
// Tool: github.create_repository
// Args:
{
  "name": "<owner>",
  "description": "Profile README showcasing my projects",
  "private": false,
  "autoInit": true
}
```

### Step 5 -- Push README + workflows in one commit

```jsonc
// Tool: github.push_files
// Args:
{
  "owner": "<owner>",
  "repo":  "<owner>",
  "branch": "main",
  "message": "feat: ship profile README + workflows + scaffolding",
  "files": [
    { "path": "README.md",                              "content": "<assembled markdown>" },
    { "path": ".github/workflows/snake.yml",            "content": "<see workflows below>" },
    { "path": ".github/workflows/quote.yml",            "content": "<see workflows below>" },
    { "path": "scripts/update-quote.js",                "content": "<see scripts below>" },
    { "path": "scripts/quotes.json",                    "content": "<see scripts below>" }
  ]
}
```

### Step 6 -- Verify

```jsonc
// Tool: github.get_file_contents
// Args: { "owner": "<owner>", "repo": "<owner>", "path": "README.md" }
// Confirm bytes >= 4500 and contains "capsule-render"
```

## Workflow files

See `.github/workflows/snake.yml`, `.github/workflows/quote.yml`, `scripts/update-quote.js`, and `scripts/quotes.json` in this same repo for the exact verbatim contents.

## Cross-posting to LinkedIn (Phase-5d)

```jsonc
// Tool: linkedin.connect_with_person
// Args: {
//   "username": "<linkedin-handle-of-someone-relevant>",
//   "note": "Hey, just shipped my profile README and noticed your work on X. Would love to connect."
// }

// Tool: linkedin.send_message
// Args: {
//   "username": "<linkedin-handle>",
//   "message": "If you're curious -- the repo lives at https://github.com/<owner> and I documented the build at github.com/<owner>/<owner>/blob/main/BUILD-GUIDE.md.",
//   "confirm_send": true
// }
```

## Pitfalls & gotchas

- **Repo must be public** -- profile rendering is silently disabled for private. `create_repository` `private:false`.
- **Repo name MUST equal the username case-insensitively** -- `Vinothhacks/vinothhacks` works, `vinothhacks/profile-readme` does not.
- **Snake action 403** -- needs `permissions: contents: write` at the workflow level. The `ghaction-github-pages` step pushes to a separate `output` branch, **not** `main`.
- **Quote workflow `permission denied`** -- same fix; add `permissions: contents: write`. The default `GITHUB_TOKEN` is sufficient -- no PAT needed.
- **Streak stats card flicker** -- both `streak-stats.demolab.com` and `github-readme-streak-stats.herokuapp.com` exist; `demolab.com` is the actively-maintained mirror.
- **Mixed light/dark theme** -- wrap dark/light variants in `<picture>` with `prefers-color-scheme` for graceful fallback.
- **Skillicons rate-limit** -- one URL with `&perline=11` is faster and never rate-limits compared to 30 individual badge images.
- **Capsule-render TLS** -- the service occasionally returns a 502; if so, refresh once.
- **`update_pull_request_branch` 422 "no new commits on base branch"** -- not a tool failure; document as PASS-with-note.
- **`request_copilot_review` 422 on a sandbox repo** that has no Copilot access -- best-effort PASS.
- **`run_secret_scanning`** returns "Repository does not have GitHub Advanced Security enabled" on personal repos -- successful tool call, not a failure.
- **`list_issue_types`** is org-only AND requires Issue Types to be enabled on the org -- 404 on most orgs is expected.
- **`get_tag`** 404s on **lightweight** tags (no annotation object). Use an annotated tag.

## Failure-loop policy (apply to every step)

1. Capture exact MCP error string.
2. Classify: auth / rate-limit / bad-arg / selector-drift / network / GHAS-disabled / scope-needed.
3. **One** automatic retry after fix.
4. If still failing, log into `tools-report.md` as FAIL with reproduction steps and **continue** the rest of the phase. Do not abort.

Special cases:

- LinkedIn MCP returns "No valid LinkedIn session" -> manually sign in to the persistent Chromium profile (no `login` tool exposed). Resume after sign-in.
- llm-mcp `BrowserContext.new_page: ... has been closed` -> restart the llm-mcp MCP server with `LLM_MCP_KILL_PROFILE_HOLDERS=1`. The persistent profile dirs in `%LOCALAPPDATA%\llm-mcp\profiles\` survive.
- llm-mcp `BlockedError` >=3 -> switch the provider's stealth engine via `LLM_MCP_STEALTH_ENGINE`.

## Pre-flight checklist

- [ ] `<owner>` resolved and confirmed via `github.get_me`.
- [ ] No existing `<owner>/<owner>` repo (or it's an okay-to-overwrite repo).
- [ ] llm-mcp `health.chatgpt_logged_in_hint` AND `health.claude_logged_in_hint` both `true`.
- [ ] Repo `<owner>/<owner>` will be **public**.
- [ ] You have at least 3 real repos to feature.
- [ ] LinkedIn handle is your public profile.
- [ ] Mobile preview tested after first ship.
- [ ] Snake graph workflow has `permissions: contents: write`.
- [ ] At least one section uses dynamic markers so workflows can rewrite it.
- [ ] All widget URLs use the literal `<owner>` value, not the placeholder.
- [ ] After first commit, pin the repo and add 2-3 topics.

## Example: end-to-end agent run

```text
1. github.get_me                                     -> owner = "vinothhacks"
2. llm-mcp.health                                    -> chatgpt+claude logged_in
3. llm-mcp.chatgpt_new_chat (model gpt-5-thinking)   -> cid_gpt
4. llm-mcp.claude_new_chat                           -> cid_claude
5. for each section in [hero, about, tech, projects, stats, connect]:
     parallel:
       chatgpt_send(cid_gpt, prompt[section])
       claude_send(cid_claude, prompt[section])
     pick = better_of(reply_gpt, reply_claude)
6. assemble README locally
7. github.create_repository(name="vinothhacks", autoInit=true, private=false)
8. github.push_files(README + workflows + scripts, commit "feat: ship profile readme")
9. github.get_file_contents("README.md")             -> verify size > 4500 bytes
10. linkedin.search_people(query="dev rel chennai")  -> first_match
11. linkedin.connect_with_person(first_match, note)
12. linkedin.send_message(first_match, repo_url, confirm_send=true)
13. linkedin.close_session
```

## When to NOT use this skill

- The user has a non-`<username>/<username>` repo and just wants a fancy README.
- The user wants a private profile -- there's no rendered profile README on private repos.
- The user wants pure HTML / no third-party renderers.
