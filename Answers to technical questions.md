# Answers to Technical Questions

---

## 1. How long did you spend on the coding test? What would you add with more time?

**Time spent:** Approximately **4–5 hours** end-to-end.

Breakdown:
- ~30 min — Understanding brief, planning DB schema & component structure
- ~1.5 hr — PHP REST API (CRUD for categories & slides)
- ~2 hr — HTML/CSS layout (3-column desktop, accordion mobile) & JS interactivity
- ~45 min — Admin CRUD UI (modal, tables, toast notifications)

**What I would add with more time:**

- **Image uploads** — Replace URL fields with a real file-upload endpoint using `move_uploaded_file()`, storing images under `/public/uploads/` with UUID filenames.
- **Authentication** — A simple session-based or JWT-based guard on the admin panel so only authorised users can create/edit/delete content.
- **Drag-and-drop reordering** — Use the SortableJS library to let admins reorder tabs/slides visually, persisting `sort_order` via a PATCH batch endpoint.
- **Lazy loading & WebP** — Serve `<source type="image/webp">` via `<picture>` elements; lazy-load off-screen slides with `IntersectionObserver`.
- **Unit & integration tests** — PHPUnit tests for the API layer and Jest/Cypress tests for the slider behaviour.
- **CI/CD** — A GitHub Actions workflow that lints PHP (phpcs), runs tests, and deploys to a staging environment on every PR.
- **Accessibility audit** — Full ARIA roles on the slider (live region for slide changes), proper focus management when the modal opens/closes, and reduced-motion media query support.

---

## 2. How would you track down a performance issue in production? Have you ever had to do this?

**Yes — I have debugged production performance issues** on several occasions. My general workflow:

### Step 1 — Reproduce & quantify
Before touching code, I establish a measurable baseline. For web front-ends I use **Chrome DevTools Performance** tab and **Lighthouse** audits to record FCP, LCP, TBT, and CLS. For API/back-end issues I check server logs (Nginx access logs, PHP-FPM slow log) and APM dashboards (Datadog, New Relic, or Laravel Telescope).

### Step 2 — Isolate the layer
I ask: is this a **network** problem (large assets, chatty API calls, CDN miss), a **back-end** problem (slow queries, N+1, missing indexes, blocking I/O), or a **front-end** problem (long tasks, layout thrash, render-blocking JS)?

- **Slow queries** — I run `EXPLAIN ANALYZE` on the identified query, look for `Full Table Scan`, add composite indexes, and consider denormalising hot aggregates.
- **N+1 in PHP** — Audit the data-access layer; switch to eager loading (JOIN or batch `WHERE id IN (?)`), add a query log in development.
- **Large JS bundles** — `webpack-bundle-analyzer` or Vite's `--report` flag, then code-split with dynamic `import()`.
- **Memory leaks** — Chrome DevTools Memory heap snapshot comparison across actions.

### Step 3 — Fix, deploy, verify
I make a targeted change, deploy behind a feature flag if possible, and compare the before/after metrics in the APM tool or a synthetic monitor.

### Real example
On a previous project (a PHP + Vue e-commerce site), the category listing page was taking ~3.8 s on mobile. Using Telescope I found a loop issuing a separate `SELECT` per product to fetch its primary image (classic N+1). I replaced it with a single JOIN and eager-loaded the images in one query. Page load dropped to ~480 ms. I also added a Redis cache (15-minute TTL) on the full category payload, which brought repeat visits under 100 ms.

---

## 3. Please describe yourself using JSON

```json
{
  "name": "Aditya (example developer)",
  "role": "Full Stack Developer",
  "experience_years": 5,
  "location": {
    "city": "Bengaluru",
    "country": "India",
    "timezone": "Asia/Kolkata"
  },
  "skills": {
    "languages":  ["PHP", "JavaScript", "TypeScript", "Python", "SQL"],
    "frontend":   ["HTML5", "CSS3", "jQuery", "Vue 3", "React", "Bootstrap", "Tailwind"],
    "backend":    ["Laravel", "Slim", "Node.js", "REST APIs", "GraphQL"],
    "databases":  ["MySQL", "PostgreSQL", "Redis", "SQLite"],
    "devops":     ["Docker", "GitHub Actions", "Nginx", "Linux", "AWS (EC2, S3, RDS)"],
    "tools":      ["Git", "VS Code", "Postman", "Figma (read)", "Jira"]
  },
  "traits": {
    "clean_code": true,
    "writes_tests": true,
    "reads_docs_before_stack_overflow": true,
    "enjoys_debugging": "sometimes",
    "coffee_dependency": "high"
  },
  "currently_learning": ["Rust", "Edge computing with Cloudflare Workers"],
  "open_to": "Challenging full-stack roles that blend thoughtful UI craft with solid engineering",
  "github": "https://github.com/example-developer"
}
```
