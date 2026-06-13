'use strict';

require('dotenv').config();
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const { Calculators, Faqs } = require('./db');

const app = express();

/* --------------------------------- Config --------------------------------- */

const PORT = process.env.PORT || 3000;
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const SITE_NAME = process.env.SITE_NAME || 'Calculator Hub';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
// Password may be supplied as a bcrypt hash (preferred) or plaintext (dev only).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret';

// Slugs that cannot be used by calculator pages (they belong to system routes).
const RESERVED_SLUGS = new Set([
  'admin', 'sitemap.xml', 'robots.txt', 'public', 'login', 'logout', 'api', 'static',
]);

/* ------------------------------- App setup -------------------------------- */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

app.use(
  session({
    name: 'calc_cms_sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }, // 8h
  })
);

// Make a few values available to every template.
app.use((req, res, next) => {
  res.locals.SITE_NAME = SITE_NAME;
  res.locals.BASE_URL = BASE_URL;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.isAdmin = !!(req.session && req.session.isAdmin);
  next();
});

/* -------------------------------- Helpers --------------------------------- */

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login');
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function canonicalFor(calc) {
  if (calc.canonical_url && calc.canonical_url.trim()) return calc.canonical_url.trim();
  return `${BASE_URL}/${calc.slug}`;
}

// Build FAQ JSON-LD schema. Answers may contain HTML, so strip tags for the
// schema text value (schema expects plain/limited HTML; plain text is safest).
function faqSchema(faqs) {
  const valid = faqs.filter((f) => f.question && f.answer);
  if (!valid.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      },
    })),
  };
}

// Parse the repeating faq[] fields coming from the admin form into pairs.
function parseFaqsFromBody(body) {
  const questions = [].concat(body.faq_question || []);
  const answers = [].concat(body.faq_answer || []);
  const out = [];
  for (let i = 0; i < Math.max(questions.length, answers.length); i++) {
    out.push({ question: questions[i] || '', answer: answers[i] || '' });
  }
  return out;
}

function buildCalcFromBody(body) {
  return {
    slug: slugify(body.slug || body.h1),
    canonical_url: (body.canonical_url || '').trim(),
    meta_title: (body.meta_title || '').trim(),
    meta_description: (body.meta_description || '').trim(),
    h1: (body.h1 || '').trim(),
    calc_html: body.calc_html || '',
    calc_css: body.calc_css || '',
    calc_js: body.calc_js || '',
    seo_content: body.seo_content || '',
    status: body.status === 'published' ? 'published' : 'draft',
  };
}

/* ===========================================================================
   PUBLIC ROUTES
   =========================================================================== */

app.get('/', (req, res) => {
  const calculators = Calculators.allPublished();
  res.render('home', {
    title: `${SITE_NAME} — Free Online Calculators`,
    metaDescription: `Browse free, fast online calculators on ${SITE_NAME}. Clean, mobile-friendly tools with clear explanations.`,
    canonical: `${BASE_URL}/`,
    calculators,
  });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', '', `Sitemap: ${BASE_URL}/sitemap.xml`, ''].join('\n')
  );
});

app.get('/sitemap.xml', (req, res) => {
  const calculators = Calculators.allPublished();
  const urls = [`${BASE_URL}/`, ...calculators.map((c) => `${BASE_URL}/${c.slug}`)];
  const lastmods = [new Date().toISOString(), ...calculators.map((c) => c.updated_at)];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u, i) =>
          `  <url>\n    <loc>${escapeXml(u)}</loc>\n    <lastmod>${escapeXml(
            lastmods[i]
          )}</lastmod>\n  </url>`
      )
      .join('\n') +
    '\n</urlset>\n';
  res.type('application/xml').send(body);
});

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])
  );
}

/* ===========================================================================
   ADMIN ROUTES
   =========================================================================== */

app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { layoutTitle: 'Admin login', error: null });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  let ok = username === ADMIN_USERNAME;
  if (ok) {
    if (ADMIN_PASSWORD_HASH) ok = bcrypt.compareSync(password || '', ADMIN_PASSWORD_HASH);
    else ok = (password || '') === ADMIN_PASSWORD;
  }
  if (!ok) {
    return res
      .status(401)
      .render('admin/login', { layoutTitle: 'Admin login', error: 'Incorrect username or password.' });
  }
  req.session.isAdmin = true;
  req.session.username = username;
  res.redirect('/admin');
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

app.get('/admin', requireAuth, (req, res) => {
  const calculators = Calculators.all();
  res.render('admin/dashboard', {
    layoutTitle: 'Dashboard',
    calculators,
    flash: req.query.msg || null,
  });
});

app.get('/admin/new', requireAuth, (req, res) => {
  res.render('admin/edit', {
    layoutTitle: 'New calculator',
    mode: 'new',
    calc: {
      id: '',
      slug: '',
      canonical_url: '',
      meta_title: '',
      meta_description: '',
      h1: '',
      calc_html: '',
      calc_css: '',
      calc_js: '',
      seo_content: '',
      status: 'draft',
    },
    faqs: [],
    error: null,
  });
});

app.post('/admin/new', requireAuth, (req, res) => {
  const data = buildCalcFromBody(req.body);
  const faqs = parseFaqsFromBody(req.body);
  const error = validateCalc(data);
  if (error) {
    return res.status(400).render('admin/edit', {
      layoutTitle: 'New calculator',
      mode: 'new',
      calc: { ...data, id: '' },
      faqs,
      error,
    });
  }
  const id = Calculators.create(data);
  Faqs.replaceAll(id, faqs);
  res.redirect('/admin?msg=' + encodeURIComponent('Calculator created.'));
});

app.get('/admin/edit/:id', requireAuth, (req, res) => {
  const calc = Calculators.byId(req.params.id);
  if (!calc) return res.status(404).render('404', { title: 'Not found', metaDescription: '', canonical: '' });
  const faqs = Faqs.forCalculator(calc.id);
  res.render('admin/edit', {
    layoutTitle: 'Edit calculator',
    mode: 'edit',
    calc,
    faqs,
    error: null,
  });
});

app.post('/admin/edit/:id', requireAuth, (req, res) => {
  const calc = Calculators.byId(req.params.id);
  if (!calc) return res.status(404).render('404', { title: 'Not found', metaDescription: '', canonical: '' });
  const data = buildCalcFromBody(req.body);
  const faqs = parseFaqsFromBody(req.body);
  const error = validateCalc(data, calc.id);
  if (error) {
    return res.status(400).render('admin/edit', {
      layoutTitle: 'Edit calculator',
      mode: 'edit',
      calc: { ...data, id: calc.id },
      faqs,
      error,
    });
  }
  Calculators.update(calc.id, data);
  Faqs.replaceAll(calc.id, faqs);
  res.redirect('/admin?msg=' + encodeURIComponent('Changes saved.'));
});

app.post('/admin/delete/:id', requireAuth, (req, res) => {
  Calculators.remove(req.params.id);
  res.redirect('/admin?msg=' + encodeURIComponent('Calculator deleted.'));
});

// Preview a page (any status) before publishing.
app.get('/admin/preview/:id', requireAuth, (req, res) => {
  const calc = Calculators.byId(req.params.id);
  if (!calc) return res.status(404).render('404', { title: 'Not found', metaDescription: '', canonical: '' });
  renderCalculatorPage(res, calc, { preview: true });
});

function validateCalc(data, exceptId = 0) {
  if (!data.h1) return 'H1 heading is required.';
  if (!data.slug) return 'A valid URL slug is required (it can be generated from the H1).';
  if (RESERVED_SLUGS.has(data.slug)) return `"${data.slug}" is a reserved URL. Please choose another slug.`;
  if (Calculators.slugExists(data.slug, exceptId)) return `The slug "${data.slug}" is already in use.`;
  return null;
}

/* ===========================================================================
   PUBLIC CALCULATOR PAGE (catch-all clean URL) — keep LAST
   =========================================================================== */

function renderCalculatorPage(res, calc, opts = {}) {
  const faqs = Faqs.forCalculator(calc.id);
  res.render('calculator', {
    title: calc.meta_title || calc.h1,
    metaDescription: calc.meta_description || '',
    canonical: canonicalFor(calc),
    calc,
    faqs,
    faqSchema: faqSchema(faqs),
    preview: !!opts.preview,
  });
}

app.get('/:slug', (req, res, next) => {
  const slug = req.params.slug;
  if (RESERVED_SLUGS.has(slug)) return next();
  const calc = Calculators.publishedBySlug(slug);
  if (!calc) return next();
  renderCalculatorPage(res, calc);
});

/* --------------------------------- 404 ------------------------------------ */

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page not found',
    metaDescription: '',
    canonical: `${BASE_URL}${req.path}`,
  });
});

/* ------------------------------- Boot up ---------------------------------- */

app.listen(PORT, () => {
  console.log(`\n  ${SITE_NAME} running`);
  console.log(`  Frontend : ${BASE_URL}/`);
  console.log(`  Admin    : ${BASE_URL}/admin/login`);
  console.log(`  Login    : ${ADMIN_USERNAME} / ${ADMIN_PASSWORD_HASH ? '(hashed password)' : ADMIN_PASSWORD}\n`);
});
