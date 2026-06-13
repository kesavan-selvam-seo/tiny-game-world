# Calculator Hub — Online Calculator Website + CMS

A server-rendered, SEO-friendly online calculator website with a built-in admin CMS.
Create and manage unlimited calculator pages — each with its own custom HTML/CSS/JS
calculator, SEO content, and FAQs — without touching code.

Built with **Node.js + Express + EJS** and the **built-in `node:sqlite`** database
(no native build step, no external database to install).

---

## Features

**Frontend (every calculator page)**
- H1 heading
- Calculator section that renders your custom HTML, CSS and JavaScript
- SEO content section that renders rich HTML (headings, paragraphs, tables, lists, links…)
- FAQ section as accessible accordions, with **FAQ schema (JSON-LD)** auto-generated
- Server-rendered for fast loading and clean indexing
- Fully responsive (mobile / tablet / desktop)

**SEO**
- Dynamic meta title and meta description per page
- Dynamic canonical URL (auto-generated from the slug, or set manually)
- Clean URLs: `https://yoursite.com/your-slug`
- `sitemap.xml` generated from published pages
- `robots.txt`
- FAQ structured data for rich results

**Admin CMS** (`/admin`)
- Simple username/password login
- Create, edit, update, delete calculator pages
- Fields: URL slug, canonical URL, meta title, meta description, H1
- Separate HTML / CSS / JavaScript editors for the calculator
- HTML editor for the SEO content
- Add / edit / remove multiple FAQs per page
- **Draft / Published** status
- **Preview** any page (including drafts) before publishing

---

## Requirements

- **Node.js 22.5 or newer** (uses the built-in `node:sqlite` module)

Check your version: `node --version`

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
#    then edit .env (set BASE_URL, SITE_NAME, admin password, SESSION_SECRET)

# 3. (Optional) Load the example "Age Calculator" page
npm run seed

# 4. Start the server
npm start
```

Then open:
- Frontend: <http://localhost:3000/>
- Admin: <http://localhost:3000/admin/login>

Default login (change it in `.env`): **admin / admin123**

---

## Creating a calculator page

1. Log in to `/admin` and click **New calculator**.
2. Fill in the **H1 heading**. The URL slug auto-fills from it (you can override it).
3. Add your **meta title / description** and optional canonical URL.
4. Paste your calculator's **HTML**, **CSS**, and **JavaScript** in the three editors.
   - Tip: scope your CSS classes (e.g. `.my-calc button`) so different calculators
     never style each other.
5. Add **SEO content** as HTML.
6. Add any number of **FAQs**.
7. Set status to **Published** (or keep as **Draft**) and click **Save changes**.
8. Use **Preview** to see the page before publishing.

---

## How custom code is handled

The calculator HTML, CSS and JS you enter are injected into the page **exactly as
written**, so any calculator works. Because this code runs on your site, only trusted
admins should have CMS access. Keep your admin password strong and secret.

---

## Deployment notes

- Set `BASE_URL` to your real domain (e.g. `https://calculators.example.com`) so
  canonical URLs, the sitemap and robots.txt are correct.
- Set a strong, random `SESSION_SECRET`.
- Use a bcrypt password hash in production:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
  ```
  Put the result in `ADMIN_PASSWORD_HASH` in `.env`.
- Run behind a reverse proxy (Nginx / Caddy) with HTTPS. Submit `sitemap.xml` to
  Google Search Console.
- The SQLite database lives in `data/calculators.db` — back this folder up.
- For multiple server processes/instances, swap the default in-memory session store
  for a persistent one (e.g. `connect-sqlite3` or Redis).

---

## Project structure

```
calculator-cms/
├── server.js              # Express app + all routes
├── db.js                  # SQLite schema + queries (node:sqlite)
├── seed.js                # Inserts the example Age Calculator
├── .env.example           # Configuration template
├── views/
│   ├── home.ejs           # Calculator listing
│   ├── calculator.ejs     # Public calculator page (4 sections + schema)
│   ├── 404.ejs
│   ├── partials/          # head / header / footer / admin chrome
│   └── admin/
│       ├── login.ejs
│       ├── dashboard.ejs  # List + status + actions
│       └── edit.ejs       # Create / edit form + FAQ repeater
└── public/
    ├── css/site.css       # Frontend styles
    ├── css/admin.css      # CMS styles
    └── js/admin.js        # FAQ repeater, code editor helpers
```
