# How to Build an Awesome GitHub Profile README

A complete, opinionated playbook -- modeled on great profiles like
[Kiran1689/kiran1689](https://github.com/Kiran1689/kiran1689) -- for turning
`https://github.com/<username>` into a showcase that lands jobs, gets stars,
and impresses recruiters scanning LinkedIn.

This guide is written so it can be followed manually OR driven entirely
through **MCP servers** (GitHub MCP + LinkedIn MCP + LLM MCP) in Cursor.

---

## 1. The Magic of the "Special" Repo

GitHub gives every user one secret weapon: if you create a public repo whose
**name exactly matches your username**, its `README.md` is rendered on your
profile page (`github.com/<username>`).

```
github.com/vinothhacks  ->  reads from  ->  github.com/vinothhacks/vinothhacks/README.md
```

Constraints:

| Rule              | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| Repo visibility   | **Public**                                              |
| Repo name         | exactly your GitHub username (case-insensitive)         |
| File              | `README.md` at repo root                                |
| Initial commit    | "Initialize with README" is fine                        |

Create it via MCP (`user-github` -> `create_repository`):

```jsonc
{
  "name": "vinothhacks",
  "description": "Profile README showcasing my projects",
  "private": false,
  "autoInit": true
}
```

---

## 2. Anatomy of a Great Profile README

Steal this 8-section blueprint:

1. **Hero banner** -- capsule-render.vercel.app or a custom PNG.
2. **Typing intro** -- `readme-typing-svg.demolab.com` for a one-line tagline.
3. **About me** -- a short YAML block reads better than prose.
4. **Tech stack** -- `skillicons.dev` is faster than 30 individual badges.
5. **Featured projects** -- 4 to 6 pinned-style cards via `github-readme-stats` pin API.
6. **GitHub stats** -- stats card + streak + top languages + trophies + contribution graph.
7. **Latest activity** -- blog posts (RSS), latest YouTube video, or "now" updates.
8. **Connect** -- LinkedIn, X, blog, email -- as **shields.io** badges, not naked links.

Optional extras: visitor counter, Spotify "now playing", "thought of the day"
quote card, GitHub Actions that auto-update sections.

---

## 3. The Widget Cookbook

Replace `<username>` with your handle in every snippet.

### 3.1 Hero Banner

```html
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,100:1f6feb&height=180&section=header&text=<username>&fontColor=ffffff&fontSize=60&animation=fadeIn" />
```

### 3.2 Typing Intro

```html
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3500&pause=900&color=58A6FF&center=true&vCenter=true&width=720&lines=Hi%2C+I'm+<username>;I+ship+full-stack+apps;Always+shipping%2C+always+learning." />
```

### 3.3 Profile Views and Followers

```html
<img src="https://komarev.com/ghpvc/?username=<username>&label=Profile%20views&color=1f6feb&style=for-the-badge" />
<img src="https://img.shields.io/github/followers/<username>?label=Follow&style=for-the-badge&color=1f6feb&logo=github" />
```

### 3.4 Tech Stack Icons

```html
<img src="https://skillicons.dev/icons?i=python,js,ts,react,nodejs,django,fastapi,docker,git,github&perline=10" />
```

### 3.5 GitHub Stats

```html
<img src="https://github-readme-stats.vercel.app/api?username=<username>&show_icons=true&count_private=true&include_all_commits=true&theme=tokyonight&hide_border=true&rank_icon=github" />
```

### 3.6 Streak Stats

```html
<img src="https://github-readme-streak-stats.herokuapp.com/?user=<username>&theme=tokyonight&hide_border=true" />
```

### 3.7 Top Languages

```html
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=<username>&layout=compact&langs_count=10&theme=tokyonight&hide_border=true" />
```

### 3.8 Trophies

```html
<img src="https://github-profile-trophy.vercel.app/?username=<username>&theme=tokyonight&no-frame=true&row=1&column=7&margin-w=10" />
```

### 3.9 Activity Graph

```html
<img src="https://github-readme-activity-graph.vercel.app/graph?username=<username>&bg_color=1a1b27&color=70a5fd&line=bf91f3&point=38bdae&area=true&hide_border=true" />
```

### 3.10 Pinned-style Project Cards

```html
<a href="https://github.com/<username>/<repo>">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=<username>&repo=<repo>&theme=tokyonight&hide_border=true" />
</a>
```

### 3.11 Connect Badges

```html
<a href="https://www.linkedin.com/in/<handle>"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
<a href="https://github.com/<username>"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" /></a>
<a href="mailto:you@example.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" /></a>
```

### 3.12 Light/Dark Aware Images

```html
<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="./dark.gif">
  <source media="(prefers-color-scheme: light)" srcset="./light.gif">
  <img alt="Skills" src="./light.gif">
</picture>
```

---

## 4. Dynamic Sections (GitHub Actions)

Auto-refresh blog posts, daily quotes, snake graphs by editing README.md
between marker comments via a workflow on cron.

### 4.1 Latest Blog Posts (RSS)

```yaml
# .github/workflows/blog-post-workflow.yml
name: Latest blog posts
on:
  schedule:    [ { cron: "0 * * * *" } ]
  workflow_dispatch:
jobs:
  update-readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: gautamkrishnar/blog-post-workflow@v1
        with:
          feed_list: "https://dev.to/feed/<your-handle>"
          max_post_count: 5
```

In README.md:

```html
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->
```

### 4.2 Daily Quote

[Kiran1689/kiran1689](https://github.com/Kiran1689/kiran1689) uses
`update-quote.js` plus a workflow that edits between
`<!--STARTS_HERE_QUOTE_CARD-->` ... `<!--ENDS_HERE_QUOTE_CARD-->`.

### 4.3 Contribution Snake

```yaml
on:
  schedule: [ { cron: "0 0 * * *" } ]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk@v3
        with:
          github_user_name: <username>
          outputs: |
            dist/github-snake.svg
            dist/github-snake-dark.svg?palette=github-dark
      - uses: crazy-max/ghaction-github-pages@v3
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 5. Layout and Aesthetic Tips

- Pick a single theme (`tokyonight`, `nightowl`, `radical`, `dark`).
- Center hero, left-align body.
- Keep it under ~300 visible lines.
- Prefer 2-column tables over 4.
- One `skillicons.dev` URL beats 30 badge images.
- Test on mobile after each change.

---

## 6. SEO and Discovery Boosters

- Set repo About description and topics on the `<username>/<username>` repo.
- Pin 4 to 6 of your strongest repos on your profile.
- Add `description` and `homepage` to every project repo.
- Add `topics` (e.g. `python`, `mcp`, `automation`).
- Keep an `<h1>` so Google indexes it nicely.

---

## 7. Cross-Posting to LinkedIn

The `user-linkedin` MCP exposes:

| Tool                     | What it does                                        |
| ------------------------ | --------------------------------------------------- |
| `get_person_profile`     | Fetch your own / a peer's profile JSON              |
| `get_feed`               | Pull your timeline                                  |
| `search_jobs`            | Audience research                                   |
| `search_people`          | Find recruiters / collaborators                     |
| `search_conversations`   | Recall old DMs / threads                            |
| `send_message`           | DM project links                                    |
| `connect_with_person`    | Personalized connection requests                    |
| `get_company_profile`    | Inspect a company before pitching                   |
| `get_company_posts`      | Read a company's recent posts                       |
| `get_inbox`              | List your conversations                             |
| `get_conversation`       | Read a specific thread                              |
| `get_sidebar_profiles`   | Quick-scan suggested people                         |
| `get_job_details`        | Pull the full text of a job posting                 |
| `close_session`          | Close the LinkedIn browser session                  |

Flow per project ship:

1. Push polished commit + README.md via the GitHub MCP.
2. Ask LLM MCP (ChatGPT or Claude) for a 200-word LinkedIn post.
3. Paste into LinkedIn (or DM via `send_message`).
4. Drop the post URL back into README under "Latest Activity".

---

## 8. The MCP-Driven Workflow

```
Idea
  -> LLM MCP (ChatGPT / Claude) drafts copy and code
    -> GitHub MCP: create_repository / push_files / create_pull_request
      -> GitHub Actions: auto-update widgets
        -> LinkedIn MCP: cross-post and DM
          -> Engagement: recruiters and collaborators
```

Draft prompt for ChatGPT / Claude:

```
Act as a developer-relations writer. Given the README of <repo>, produce:
1. A 1-line tagline (<= 90 chars).
2. A 200-word LinkedIn post: hook + problem + tech + soft CTA + 3 hashtags.
3. A 50-word GitHub repo About string.
Tone: confident, no buzzwords, no emojis except 1 in the hook.
```

Drive that through `chatgpt_send` (LLM MCP), copy the output into LinkedIn or
GitHub, done.

---

## 9. Pre-flight Checklist

- [ ] Repo name matches username exactly (case-insensitive).
- [ ] All widget URLs use real `<username>`.
- [ ] Each badge / stat card actually loads on github.com.
- [ ] Mobile view tested.
- [ ] No private email leaked.
- [ ] LinkedIn URL is your public profile.
- [ ] At least 4 projects linked.
- [ ] `.github/workflows/` exists for any dynamic section.
- [ ] Showcase repo + 5 strong projects pinned on profile.
- [ ] You have a few stars on profile (star a few related projects).

---

## 10. Going Beyond

- **Now page** -- a YAML/JSON-driven "this week" block.
- **Repo auto-tagger** -- Action that opens a PR with topics on every new repo.
- **Auto-changelog** -- main push regenerates a Latest Releases table.
- **Visitor map** -- `github-profile-summary-cards` or a Cloudflare Worker.
- **Voice intro** -- 20-second mp3 hosted on GitHub Pages, embedded via `<audio>`.

Have fun, ship often, and let the MCPs do the boring parts.

-- Built using the `user-github` + `user-llm-mcp` + `user-linkedin` MCP servers in Cursor.
