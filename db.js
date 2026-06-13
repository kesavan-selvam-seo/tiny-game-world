'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'calculators.db'));

// Pragmas for reliability + speed
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS calculators (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    slug             TEXT UNIQUE NOT NULL,
    canonical_url    TEXT DEFAULT '',
    meta_title       TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    h1               TEXT NOT NULL,
    calc_html        TEXT DEFAULT '',
    calc_css         TEXT DEFAULT '',
    calc_js          TEXT DEFAULT '',
    seo_content      TEXT DEFAULT '',
    status           TEXT NOT NULL DEFAULT 'draft',
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    calculator_id INTEGER NOT NULL,
    question      TEXT DEFAULT '',
    answer        TEXT DEFAULT '',
    sort_order    INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (calculator_id) REFERENCES calculators(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_faqs_calc ON faqs(calculator_id);
  CREATE INDEX IF NOT EXISTS idx_calc_status ON calculators(status);
`);

const nowISO = () => new Date().toISOString();

/* ---------------------------- Calculator queries --------------------------- */

const Calculators = {
  all() {
    return db.prepare('SELECT * FROM calculators ORDER BY updated_at DESC').all();
  },

  allPublished() {
    return db
      .prepare("SELECT * FROM calculators WHERE status = 'published' ORDER BY updated_at DESC")
      .all();
  },

  byId(id) {
    return db.prepare('SELECT * FROM calculators WHERE id = ?').get(id);
  },

  bySlug(slug) {
    return db.prepare('SELECT * FROM calculators WHERE slug = ?').get(slug);
  },

  publishedBySlug(slug) {
    return db
      .prepare("SELECT * FROM calculators WHERE slug = ? AND status = 'published'")
      .get(slug);
  },

  slugExists(slug, exceptId = 0) {
    const row = db
      .prepare('SELECT id FROM calculators WHERE slug = ? AND id != ?')
      .get(slug, exceptId);
    return !!row;
  },

  create(data) {
    const ts = nowISO();
    const info = db
      .prepare(
        `INSERT INTO calculators
          (slug, canonical_url, meta_title, meta_description, h1,
           calc_html, calc_css, calc_js, seo_content, status, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(
        data.slug,
        data.canonical_url || '',
        data.meta_title || '',
        data.meta_description || '',
        data.h1,
        data.calc_html || '',
        data.calc_css || '',
        data.calc_js || '',
        data.seo_content || '',
        data.status || 'draft',
        ts,
        ts
      );
    return Number(info.lastInsertRowid);
  },

  update(id, data) {
    db.prepare(
      `UPDATE calculators SET
         slug = ?, canonical_url = ?, meta_title = ?, meta_description = ?, h1 = ?,
         calc_html = ?, calc_css = ?, calc_js = ?, seo_content = ?, status = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      data.slug,
      data.canonical_url || '',
      data.meta_title || '',
      data.meta_description || '',
      data.h1,
      data.calc_html || '',
      data.calc_css || '',
      data.calc_js || '',
      data.seo_content || '',
      data.status || 'draft',
      nowISO(),
      id
    );
  },

  remove(id) {
    db.prepare('DELETE FROM calculators WHERE id = ?').run(id);
  },
};

/* -------------------------------- FAQ queries ------------------------------ */

const Faqs = {
  forCalculator(calcId) {
    return db
      .prepare('SELECT * FROM faqs WHERE calculator_id = ? ORDER BY sort_order ASC, id ASC')
      .all(calcId);
  },

  replaceAll(calcId, faqs) {
    const del = db.prepare('DELETE FROM faqs WHERE calculator_id = ?');
    const ins = db.prepare(
      'INSERT INTO faqs (calculator_id, question, answer, sort_order) VALUES (?,?,?,?)'
    );
    del.run(calcId);
    faqs.forEach((f, i) => {
      const q = (f.question || '').trim();
      const a = (f.answer || '').trim();
      if (q || a) ins.run(calcId, q, a, i);
    });
  },
};

module.exports = { db, Calculators, Faqs };
