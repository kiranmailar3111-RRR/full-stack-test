# Answers to Technical Questions

## 1. How long did you spend on the coding test? What would you add with more time?

I spent approximately 4-5 Hours on the test, covering database design, PHP/MySQL CRUD, the tabbed-slider UI, mobile accordion, and responsive styling.

With more time I would add:
- **Pagination** on the CRUD admin list
- **REST API layer** returning JSON for the frontend fetch
- **Image upload** with server-side validation and optimised thumbnails
- **Drag-to-reorder** slider items using jQuery UI Sortable (persisted via AJAX)
- **Unit tests** for the PHP data layer using PHPUnit
- **AJAX form submission** to avoid full-page reloads on CRUD actions
- **Lazy loading** on slider images to improve Largest Contentful Paint score

---

## 2. How would you track down a performance issue in production?

My approach follows a structured funnel:

1. **Identify the symptom** — Check server monitoring (New Relic, Datadog, or Nginx/Apache logs) for high response times, CPU spikes, or memory exhaustion.
2. **Isolate the layer** — Is the bottleneck the database, PHP execution, or network? I use `EXPLAIN` in MySQL for slow queries and enable `slow_query_log` to catch expensive ones.
3. **Profile the code** — Use `Xdebug` or `Blackfire.io` to generate a call graph showing which functions consume the most time.
4. **Check caching** — Verify OPcache is warm and no repeated DB queries are slipping through due to missing object/query cache.
5. **Fix and verify** — Deploy the fix, compare before/after metrics, and add a regression test.

**Real experience:** At Angika Technologies I traced a slow admin dashboard to an N+1 query inside a WordPress loop — each post fired a separate meta query. I resolved it by using `get_posts()` with `update_post_meta_cache` set to `true`, reducing ~80 queries per page load to 3.

---

## 3. Please describe yourself using JSON

```json
{
  "name": "Ravikiran",
  "role": "Full Stack Developer",
  "experience_years": 2.4,
  "location": "Bengaluru, India",
  "stack": {
    "backend":  ["PHP", "Laravel", "Livewire", "WordPress"],
    "frontend": ["React.js", "jQuery", "Tailwind CSS", "Bootstrap"],
    "database": ["MySQL"],
    "tools":    ["Git", "Postman", "VS Code"]
  },
  "traits": {
    "problem_solver": true,
    "detail_oriented": true,
    "continuous_learner": true,
    "team_player": true
  },
  "currently_building": [
    "Multi-Website Dynamic CMS Builder",
    "AI-powered chat platform (Groq + SSE)",
    "BotPilot — chatbot SaaS"
  ],
  "goal": "Ship products that are fast, accessible, and maintainable",
  "available_for": "Full-time opportunity"
}
```
