'use strict';

const { Calculators, Faqs } = require('./db');

const slug = 'age-calculator';

const calcHtml = `
<div class="age-calc">
  <div class="age-calc__row">
    <label for="ac-dob">Your date of birth</label>
    <input type="date" id="ac-dob" max="" />
  </div>
  <button type="button" id="ac-btn" class="age-calc__btn">Calculate age</button>
  <div id="ac-result" class="age-calc__result" hidden>
    <div class="age-calc__big"><span id="ac-years">0</span> years</div>
    <p id="ac-detail" class="age-calc__detail"></p>
  </div>
  <p id="ac-error" class="age-calc__error" hidden>Please choose a valid date in the past.</p>
</div>
`.trim();

const calcCss = `
.age-calc { font-family: inherit; }
.age-calc__row { margin-bottom: 16px; }
.age-calc__row label { display:block; font-weight:600; margin-bottom:8px; }
.age-calc__row input { width:100%; padding:12px 14px; font-size:16px; border:1px solid #d4d8df; border-radius:10px; }
.age-calc__row input:focus { outline:none; border-color:#2d5bff; box-shadow:0 0 0 3px #eaeeff; }
.age-calc__btn { width:100%; padding:13px; font-size:15px; font-weight:600; color:#fff; background:#2d5bff; border:none; border-radius:10px; cursor:pointer; }
.age-calc__btn:hover { background:#1b3fcc; }
.age-calc__result { margin-top:20px; padding:20px; background:#f6f8ff; border:1px solid #dbe3ff; border-radius:12px; text-align:center; }
.age-calc__big { font-size:2rem; font-weight:700; color:#1b3fcc; }
.age-calc__detail { margin:8px 0 0; color:#3a3d45; }
.age-calc__error { margin-top:14px; color:#d33b4d; font-size:14px; }
`.trim();

const calcJs = `
(function () {
  var dob = document.getElementById('ac-dob');
  var btn = document.getElementById('ac-btn');
  var result = document.getElementById('ac-result');
  var error = document.getElementById('ac-error');
  if (!dob || !btn) return;
  dob.max = new Date().toISOString().split('T')[0];

  btn.addEventListener('click', function () {
    error.hidden = true;
    result.hidden = true;
    if (!dob.value) { error.hidden = false; return; }
    var birth = new Date(dob.value);
    var now = new Date();
    if (isNaN(birth.getTime()) || birth > now) { error.hidden = false; return; }

    var years = now.getFullYear() - birth.getFullYear();
    var months = now.getMonth() - birth.getMonth();
    var days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    document.getElementById('ac-years').textContent = years;
    document.getElementById('ac-detail').textContent =
      'That is ' + years + ' years, ' + months + ' months and ' + days + ' days.';
    result.hidden = false;
  });
})();
`.trim();

const seoContent = `
<h2>What is an age calculator?</h2>
<p>An age calculator works out exactly how old you are from your date of birth to today. Instead of counting on your fingers, it returns your age in <strong>years, months and days</strong> in a single click.</p>
<h2>How to use it</h2>
<ol>
  <li>Select your date of birth using the date picker above.</li>
  <li>Click <strong>Calculate age</strong>.</li>
  <li>Read your exact age, broken down by years, months and days.</li>
</ol>
<h2>Common uses</h2>
<table>
  <thead><tr><th>Situation</th><th>Why exact age matters</th></tr></thead>
  <tbody>
    <tr><td>Application forms</td><td>Many forms require age as of a specific date.</td></tr>
    <tr><td>Eligibility checks</td><td>Schemes and memberships often have age cut-offs.</td></tr>
    <tr><td>Milestones</td><td>Knowing days lived is fun for birthdays and anniversaries.</td></tr>
  </tbody>
</table>
`.trim();

const faqs = [
  { question: 'Is this age calculator free to use?', answer: '<p>Yes. It runs entirely in your browser and is completely free, with no sign-up required.</p>' },
  { question: 'How is my age calculated?', answer: '<p>It compares your date of birth with today’s date and counts the full years, then the remaining months and days.</p>' },
  { question: 'Is my date of birth stored anywhere?', answer: '<p>No. The calculation happens on your device. Your date of birth is never sent to a server.</p>' },
];

const existing = Calculators.bySlug(slug);
if (existing) {
  console.log(`Example "${slug}" already exists (id ${existing.id}); skipping seed.`);
  process.exit(0);
}

const id = Calculators.create({
  slug,
  canonical_url: '',
  meta_title: 'Age Calculator — Find Your Exact Age in Years, Months & Days',
  meta_description:
    'Free online age calculator. Enter your date of birth to find your exact age in years, months and days instantly. No sign-up, works on any device.',
  h1: 'Age Calculator',
  calc_html: calcHtml,
  calc_css: calcCss,
  calc_js: calcJs,
  seo_content: seoContent,
  status: 'published',
});
Faqs.replaceAll(id, faqs);

console.log(`Seeded example calculator "${slug}" (id ${id}).`);
process.exit(0);
