import './styles.css';
import { deleteEntry, discardDemoDatabase, getEntries, putEntry, replaceEntries } from './db';
import { formatWeek, isWebSource, localDate, moveWeek, startOfWeek, toCsv, validateBundle, weekContains } from './model';
import { watchForServiceWorkerUpdate } from './service-worker-update';
import type { ApplicationNote, ExportBundle, PracticeEntry } from './types';

const PRODUCT = 'work-study-evidence-log';
const DEMO_MODE = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const STORAGE_PREFIX = DEMO_MODE ? 'demo:' : '';
const THEME_KEY = `${STORAGE_PREFIX}pel_theme`;
const DEMO_SEEDED_KEY = 'demo:practice-evidence-log:seeded';
const LICENSE_KEY = `${STORAGE_PREFIX}sb_license:${PRODUCT}`;
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const BILLING_BASE = (import.meta.env.VITE_BILLING_BASE_URL || 'https://api.sociobot.in').replace(/\/$/, '');
const app = document.querySelector<HTMLDivElement>('#app')!;

let entries: PracticeEntry[] = [];
let weekStart = startOfWeek(localDate());
let editingId: string | null = null;
let applicationEntryId: string | null = null;
let archiveOpen = false;
let unlocked = false;
let storageReady = true;

const esc = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
const uid = (): string => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function applyTheme(value: string): void {
  document.documentElement.dataset.theme = value;
  const dark = value === 'dark' || (value === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111918' : '#f2f5f2');
}

const storedTheme = localStorage.getItem(THEME_KEY) || 'system';
applyTheme(storedTheme);
document.title = DEMO_MODE ? 'Demo — Practice Evidence Log' : 'Practice Evidence Log — Link study to work';
if (DEMO_MODE) {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const canonicalUrl = 'https://work-study-evidence-log.sociobot.in/demo';
  canonical?.setAttribute('href', canonicalUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', 'Demo — Practice Evidence Log');
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Practice Evidence Log');
}

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="/" aria-label="Practice Evidence Log home">
      <svg viewBox="0 0 42 42" aria-hidden="true"><path d="M9 9h19v25H9z"/><path class="brand-seam" d="M13 22c5-4 9-4 13 0 3 2 6 2 9-1"/></svg>
      <span>Practice Evidence Log</span>
    </a>
    <nav aria-label="Primary">
      <a href="#log">Evidence</a>
      <a href="/demo">Demo</a>
      <button class="plain-button" id="open-data" type="button">Data & access</button>
      <label class="theme-label" for="theme"><span>Theme</span><select id="theme" aria-label="Color theme"><option value="system">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
    </nav>
  </header>

  ${DEMO_MODE ? `<aside class="demo-banner" aria-label="Demo mode"><p><strong>Demo — sample data, nothing is saved to your log.</strong></p><div><button class="plain-button" id="reset-demo" type="button">Reset demo</button><button class="secondary compact" id="start-real" type="button">Start for real</button></div></aside>` : ''}

  <main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow">A private record of transfer</p>
        <h1 id="page-title">Connect practice to where it helps.</h1>
        <p class="lede">For working professionals who study around a job, this log connects a focused practice block to later work use.</p>
        <div class="hero-actions">
          <a class="primary" href="/demo">Try it with sample data</a>
          <button class="secondary" id="open-entry" type="button">Log your practice</button>
        </div>
        <p class="action-note">The sample opens a separate demo log. Your own log stays untouched.</p>
        <ul class="hero-facts" aria-label="Product facts">
          <li><strong>Private:</strong> records stay on this device.</li>
          <li><strong>Offline:</strong> log after your first visit.</li>
          <li><strong>Price:</strong> weekly logging and exports are free. The optional review costs $12 once.</li>
        </ul>
        <p class="privacy-nudge"><span aria-hidden="true">◇</span><span><strong>Keep work details abstract.</strong> Don’t paste customer names, credentials, internal links, or confidential incident data.</span></p>
      </div>
      <figure class="hero-art">
        <picture>
          <source media="(max-width: 700px)" srcset="/assets/ceramic-transfer-720.webp" />
          <img src="/assets/ceramic-transfer-1200.webp" width="1200" height="800" alt="Two pale ceramic forms connected by a cobalt glaze line, representing practice carried into work" decoding="async" fetchpriority="high" />
        </picture>
        <figcaption>Practice on one side. Lived evidence on the other.</figcaption>
      </figure>
    </section>

    <div class="connection-rule" aria-hidden="true"><span></span></div>

    <section class="log-section" id="log" aria-labelledby="week-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Weekly shelf</p>
          <h2 id="week-heading">This week</h2>
          <p id="week-range" class="muted"></p>
        </div>
        <div class="week-controls" aria-label="Choose week">
          <button class="icon-button" id="previous-week" type="button" aria-label="Previous week">←</button>
          <button class="secondary compact" id="this-week" type="button">This week</button>
          <button class="icon-button" id="next-week" type="button" aria-label="Next week">→</button>
        </div>
      </div>
      <div id="storage-warning" class="notice danger" role="alert" hidden></div>
      <div id="evidence-list" class="evidence-list" aria-live="polite" aria-busy="true">
        <div class="loading-slip"><span></span><span></span><span></span><p>Opening your local shelf…</p></div>
      </div>
      <div class="below-list-actions">
        <button class="secondary" id="add-from-list" type="button">Log another practice block</button>
        <button class="plain-button archive-button" id="archive-toggle" type="button"><span aria-hidden="true">⌁</span> View archive</button>
      </div>
    </section>

    <section class="method" id="how-it-works" aria-labelledby="method-title">
      <div class="method-intro">
        <p class="eyebrow">The quiet loop</p>
        <h2 id="method-title">A trail, not a score.</h2>
        <p>No streaks and no performance claims. Just enough structure to recall what you practised and notice when it carried into a real task.</p>
      </div>
      <ol class="method-steps">
        <li><span>01</span><div><h3>Leave a prompt</h3><p>Record one question your future self should be able to answer without looking.</p></div></li>
        <li><span>02</span><div><h3>Return after work</h3><p>When the idea helps, add a short, de-identified note to the same practice block.</p></div></li>
        <li><span>03</span><div><h3>Read the seam</h3><p>Review the connection itself—not minutes accumulated—to choose what deserves another session.</p></div></li>
      </ol>
    </section>

    <section class="paid-review" id="paid-review" aria-labelledby="review-title">
      <div>
        <p class="eyebrow">Evidence pass · one-time $12</p>
        <h2 id="review-title">Turn the archive into a reflection sheet.</h2>
        <p>The optional pass adds an all-weeks lens and a printable, on-device transfer review. Logging, navigating every week, and JSON/CSV export always remain free.</p>
      </div>
      <div id="review-action"></div>
    </section>
  </main>

  <footer>
    <p><strong>Practice Evidence Log</strong><br />A private practice-to-work record with no account or analytics.</p>
    <nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><button class="plain-button" id="footer-data" type="button">Export & restore</button></nav>
    <p class="disclosure">Ceramic still life generated for this product. Built by Param Factory · v1.0.1</p>
  </footer>

  <div class="connectivity" id="connectivity" role="status" hidden><span aria-hidden="true">○</span> Offline — local logging and export still work.</div>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

  <dialog id="entry-dialog" aria-labelledby="entry-dialog-title">
    <form id="entry-form" method="dialog" novalidate>
      <div class="dialog-heading"><div><p class="eyebrow">Practice block</p><h2 id="entry-dialog-title">Log practice</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close">×</button></div>
      <p class="dialog-note">Keep sources and questions free of confidential work details. All fields marked <span aria-hidden="true">*</span><span class="sr-only">required</span> are required.</p>
      <div class="field-row">
        <label><span>Date *</span><input id="practiced-on" name="practicedOn" type="date" required /></label>
        <label><span>Minutes *</span><input id="minutes" name="minutes" type="number" inputmode="numeric" min="10" max="60" step="5" value="30" required /><small>10–60 minutes</small></label>
      </div>
      <label><span>Topic *</span><input id="topic" name="topic" type="text" maxlength="100" autocomplete="off" required placeholder="e.g. TCP retransmission" /></label>
      <label><span>Source *</span><input id="source" name="source" type="text" maxlength="240" autocomplete="off" required placeholder="Book title, article, course, or URL" /></label>
      <label><span>Retrieval prompt *</span><textarea id="retrieval-prompt" name="retrievalPrompt" maxlength="500" rows="3" required placeholder="What should you be able to explain without looking?"></textarea></label>
      <label><span>Open question <em>optional</em></span><textarea id="open-question" name="openQuestion" maxlength="500" rows="2" placeholder="What is still unclear or worth testing?"></textarea></label>
      <p class="form-error" id="entry-error" role="alert"></p>
      <div class="dialog-actions"><button class="plain-button close-dialog" type="button">Cancel</button><button class="primary" type="submit">Save practice</button></div>
    </form>
  </dialog>

  <dialog id="application-dialog" aria-labelledby="application-title">
    <form id="application-form" method="dialog" novalidate>
      <div class="dialog-heading"><div><p class="eyebrow">Link to work</p><h2 id="application-title">Where did it help?</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close">×</button></div>
      <p class="dialog-note"><strong>Describe the pattern, not the incident.</strong> Leave out employers, customers, systems, credentials, and private links.</p>
      <label><span>Date used *</span><input id="used-on" name="usedOn" type="date" required /></label>
      <label><span>Application note *</span><textarea id="application-note" name="note" maxlength="600" rows="5" required placeholder="e.g. Recognised the retry pattern and chose which signal to inspect next."></textarea></label>
      <p class="form-error" id="application-error" role="alert"></p>
      <div class="dialog-actions"><button class="plain-button close-dialog" type="button">Cancel</button><button class="primary" type="submit">Link this use</button></div>
    </form>
  </dialog>

  <dialog id="delete-dialog" aria-labelledby="delete-title">
    <form method="dialog">
      <div class="dialog-heading"><div><p class="eyebrow">Remove evidence</p><h2 id="delete-title">Delete this practice block?</h2></div></div>
      <p id="delete-description">This also removes its linked work-use notes. This cannot be undone.</p>
      <div class="dialog-actions"><button class="plain-button" value="cancel">Keep it</button><button class="danger-button" id="confirm-delete" value="default">Delete practice</button></div>
    </form>
  </dialog>

  <dialog id="data-dialog" aria-labelledby="data-title">
    <div class="dialog-heading"><div><p class="eyebrow">Private tools</p><h2 id="data-title">Your data & access</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close">×</button></div>
    <section class="dialog-section"><h3>Portable by design</h3><p>Exports include every practice block and application note. Import replaces this device’s current log after confirmation.</p><div class="button-row"><button class="secondary" id="export-json" type="button">Export JSON</button><button class="secondary" id="export-csv" type="button">Export CSV</button><label class="secondary file-button" for="import-json">Import JSON</label><input class="visually-hidden" id="import-json" type="file" accept="application/json,.json" /></div></section>
    <section class="dialog-section license-section"><p class="eyebrow">Evidence pass · $12 once</p><h3>Archive lens + printable review</h3><p>A one-time purchase supports the private tool. Sociobot/Dodo is the merchant of record; refunds are handled there and revoke the license.</p><a class="primary inline-button" href="${BILLING_BASE}/api/v1/products/${PRODUCT}/checkout">Buy the evidence pass</a><form id="license-form"><label><span>Have a license? Paste it here</span><div class="input-action"><input id="license-token" type="text" autocomplete="off" spellcheck="false" aria-describedby="license-status" /><button class="secondary compact" type="submit">Verify license</button></div></label><p id="license-status" class="muted" role="status"></p></form><p class="legal-small">By buying, you agree to the <a href="/terms/">terms</a>. See how license checks work in the <a href="/privacy/">privacy notice</a>.</p></section>
  </dialog>

  <dialog id="review-dialog" aria-labelledby="reflection-title">
    <div class="dialog-heading"><div><p class="eyebrow">Private reflection</p><h2 id="reflection-title">Transfer review</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close">×</button></div>
    <div id="reflection-content"></div>
    <div class="dialog-actions"><button class="plain-button close-dialog" type="button">Close</button><button class="secondary" id="print-review" type="button">Print review</button></div>
  </dialog>
`;

const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const entryDialog = byId<HTMLDialogElement>('entry-dialog');
const applicationDialog = byId<HTMLDialogElement>('application-dialog');
const deleteDialog = byId<HTMLDialogElement>('delete-dialog');
const dataDialog = byId<HTMLDialogElement>('data-dialog');
const reviewDialog = byId<HTMLDialogElement>('review-dialog');

function announce(message: string): void {
  const toast = byId<HTMLDivElement>('toast');
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 4200);
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

function sampleEntries(): PracticeEntry[] {
  const today = localDate();
  const firstDate = shiftDate(today, -2);
  const secondDate = shiftDate(today, -1);
  const now = new Date().toISOString();
  return [
    {
      id: 'demo-retry-signals',
      practicedOn: firstDate,
      topic: 'Reading retry signals',
      minutes: 30,
      source: 'Designing Data-Intensive Applications, chapter 8',
      retrievalPrompt: 'Which signals separate a slow dependency from a failed retry policy?',
      openQuestion: 'When should jitter increase with each attempt?',
      applications: [{
        id: 'demo-retry-use',
        usedOn: secondDate,
        note: 'Recognised clustered retries and checked dependency latency before changing the timeout.',
        createdAt: now
      }],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'demo-query-plan',
      practicedOn: today,
      topic: 'Comparing query plans',
      minutes: 20,
      source: 'PostgreSQL documentation: EXPLAIN',
      retrievalPrompt: 'What makes an estimated row count differ from the actual count?',
      openQuestion: 'Which statistics should be refreshed first?',
      applications: [],
      createdAt: now,
      updatedAt: now
    }
  ];
}

function sourceMarkup(source: string): string {
  if (isWebSource(source)) return `<a href="${esc(source)}" target="_blank" rel="noreferrer">Open source <span class="sr-only">(opens in a new tab)</span> ↗</a>`;
  return `<span>${esc(source)}</span>`;
}

function entryMarkup(entry: PracticeEntry): string {
  const applications = entry.applications.length
    ? `<div class="application-seam"><p class="seam-label"><span aria-hidden="true">●</span> Used in work</p>${entry.applications.map((note) => `<article class="application-note"><p>${esc(note.note)}</p><div><time datetime="${note.usedOn}">${dateLabel(note.usedOn)}</time><button class="plain-button remove-application" type="button" data-entry="${entry.id}" data-application="${note.id}" aria-label="Remove work-use note from ${esc(entry.topic)}">Remove</button></div></article>`).join('')}</div>`
    : `<div class="unlinked"><span>No work use linked yet</span><button class="plain-button add-application" type="button" data-id="${entry.id}">Link a work use</button></div>`;
  return `<article class="evidence-slip" data-id="${entry.id}">
    <div class="slip-meta"><time datetime="${entry.practicedOn}">${dateLabel(entry.practicedOn)}</time><span>${entry.minutes} min</span><span class="source">${sourceMarkup(entry.source)}</span></div>
    <h3>${esc(entry.topic)}</h3>
    <div class="retrieval"><p class="label">Retrieve</p><p>${esc(entry.retrievalPrompt)}</p></div>
    ${entry.openQuestion ? `<div class="open-question"><p class="label">Still open</p><p>${esc(entry.openQuestion)}</p></div>` : ''}
    ${applications}
    <div class="slip-actions">${entry.applications.length ? `<button class="plain-button add-application" type="button" data-id="${entry.id}">Add another work use</button>` : ''}<button class="plain-button edit-entry" type="button" data-id="${entry.id}">Edit</button><button class="plain-button delete-entry" type="button" data-id="${entry.id}">Delete</button></div>
  </article>`;
}

function render(): void {
  byId('week-range').textContent = archiveOpen ? 'Every week on this device' : formatWeek(weekStart);
  byId('week-heading').textContent = archiveOpen ? 'Archive lens' : (weekStart === startOfWeek(localDate()) ? 'This week' : 'A week in practice');
  const visible = archiveOpen ? entries : entries.filter((entry) => weekContains(weekStart, entry.practicedOn));
  const list = byId('evidence-list');
  list.setAttribute('aria-busy', 'false');
  if (visible.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-mark" aria-hidden="true"><span></span></div><p class="eyebrow">An open shelf</p><h3>${archiveOpen ? 'No practice saved yet.' : 'Nothing recorded for this week.'}</h3><p>${archiveOpen ? 'Begin with one focused block and leave a prompt you can retrieve later.' : 'Move to another week, or leave one clear prompt from your next 10–60 minute block.'}</p><button class="primary" id="empty-add" type="button">Log practice</button></div>`;
    byId<HTMLButtonElement>('empty-add').addEventListener('click', () => openEntry());
  } else {
    list.innerHTML = visible.map(entryMarkup).join('');
  }
  byId('archive-toggle').innerHTML = archiveOpen ? '<span aria-hidden="true">←</span> Return to weekly shelf' : '<span aria-hidden="true">⌁</span> View archive';
  byId('previous-week').toggleAttribute('disabled', archiveOpen);
  byId('next-week').toggleAttribute('disabled', archiveOpen);
  byId('this-week').toggleAttribute('disabled', archiveOpen);
  renderPaidAction();
}

function openEntry(entry?: PracticeEntry): void {
  editingId = entry?.id ?? null;
  byId('entry-dialog-title').textContent = entry ? 'Edit practice' : 'Log practice';
  const form = byId<HTMLFormElement>('entry-form');
  form.reset();
  (form.elements.namedItem('practicedOn') as HTMLInputElement).value = entry?.practicedOn ?? localDate();
  (form.elements.namedItem('minutes') as HTMLInputElement).value = String(entry?.minutes ?? 30);
  (form.elements.namedItem('topic') as HTMLInputElement).value = entry?.topic ?? '';
  (form.elements.namedItem('source') as HTMLInputElement).value = entry?.source ?? '';
  (form.elements.namedItem('retrievalPrompt') as HTMLTextAreaElement).value = entry?.retrievalPrompt ?? '';
  (form.elements.namedItem('openQuestion') as HTMLTextAreaElement).value = entry?.openQuestion ?? '';
  byId('entry-error').textContent = '';
  entryDialog.showModal();
  window.setTimeout(() => byId<HTMLInputElement>('topic').focus(), 0);
}

async function saveEntry(form: HTMLFormElement): Promise<void> {
  const topicInput = form.elements.namedItem('topic') as HTMLInputElement;
  const sourceInput = form.elements.namedItem('source') as HTMLInputElement;
  const promptInput = form.elements.namedItem('retrievalPrompt') as HTMLTextAreaElement;
  const requiredText = [
    [topicInput, 'Enter a topic, not spaces.'],
    [sourceInput, 'Enter a source, not spaces.'],
    [promptInput, 'Enter a retrieval prompt, not spaces.']
  ] as const;
  for (const [field, message] of requiredText) field.setCustomValidity(field.value.trim() ? '' : message);
  if (!form.reportValidity()) {
    byId('entry-error').textContent = requiredText.some(([field]) => !field.value.trim())
      ? 'Complete each required field with text, not spaces.'
      : 'Choose 10 to 60 minutes in five-minute steps.';
    return;
  }
  const data = new FormData(form);
  const minutes = Number(data.get('minutes'));
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 60 || minutes % 5 !== 0) {
    byId('entry-error').textContent = 'Choose 10 to 60 minutes in five-minute steps.';
    return;
  }
  const existing = entries.find((entry) => entry.id === editingId);
  const now = new Date().toISOString();
  const entry: PracticeEntry = {
    id: existing?.id ?? uid(),
    practicedOn: String(data.get('practicedOn')),
    topic: String(data.get('topic')).trim(),
    minutes,
    source: String(data.get('source')).trim(),
    retrievalPrompt: String(data.get('retrievalPrompt')).trim(),
    openQuestion: String(data.get('openQuestion')).trim(),
    applications: existing?.applications ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
  try {
    await putEntry(entry);
    entries = [entry, ...entries.filter((item) => item.id !== entry.id)].sort((a, b) => b.practicedOn.localeCompare(a.practicedOn));
    weekStart = startOfWeek(entry.practicedOn);
    archiveOpen = false;
    entryDialog.close();
    render();
    announce(existing ? 'Practice updated.' : 'Practice saved on this device.');
  } catch {
    byId('entry-error').textContent = 'This device could not save the entry. Check private-browsing or storage settings and try again.';
  }
}

function openApplication(id: string): void {
  applicationEntryId = id;
  const entry = entries.find((item) => item.id === id);
  byId('application-title').textContent = entry ? `Where did “${entry.topic}” help?` : 'Where did it help?';
  const form = byId<HTMLFormElement>('application-form');
  form.reset();
  const usedOn = form.elements.namedItem('usedOn') as HTMLInputElement;
  usedOn.value = localDate() < (entry?.practicedOn ?? '') ? entry!.practicedOn : localDate();
  usedOn.min = entry?.practicedOn ?? '';
  byId('application-error').textContent = '';
  applicationDialog.showModal();
  window.setTimeout(() => byId<HTMLTextAreaElement>('application-note').focus(), 0);
}

async function saveApplication(form: HTMLFormElement): Promise<void> {
  const noteInput = form.elements.namedItem('note') as HTMLTextAreaElement;
  noteInput.setCustomValidity(noteInput.value.trim() ? '' : 'Enter an application note, not spaces.');
  if (!form.reportValidity() || !applicationEntryId) {
    byId('application-error').textContent = noteInput.value.trim()
      ? 'Choose the practice date or a later date.'
      : 'Enter an application note with text, not spaces.';
    return;
  }
  const entry = entries.find((item) => item.id === applicationEntryId);
  if (!entry) return;
  const data = new FormData(form);
  const usedOn = String(data.get('usedOn'));
  if (usedOn < entry.practicedOn) {
    byId('application-error').textContent = `Choose ${dateLabel(entry.practicedOn)} or a later date.`;
    (form.elements.namedItem('usedOn') as HTMLInputElement).focus();
    return;
  }
  const application: ApplicationNote = { id: uid(), usedOn, note: String(data.get('note')).trim(), createdAt: new Date().toISOString() };
  const updated = { ...entry, applications: [...entry.applications, application], updatedAt: new Date().toISOString() };
  try {
    await putEntry(updated);
    entries = entries.map((item) => item.id === updated.id ? updated : item);
    applicationDialog.close();
    render();
    announce('Work use linked to its practice.');
  } catch {
    byId('application-error').textContent = 'This note could not be saved locally. Check storage settings and try again.';
  }
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function renderPaidAction(): void {
  byId('review-action').innerHTML = unlocked
    ? '<button class="secondary" id="open-review" type="button">Open transfer review</button><p class="license-active"><span aria-hidden="true">●</span> Evidence pass active on this device</p>'
    : '<button class="secondary" id="unlock-review" type="button">See the one-time pass</button>';
  byId('open-review')?.addEventListener('click', openReview);
  byId('unlock-review')?.addEventListener('click', () => dataDialog.showModal());
}

function openReview(): void {
  const used = entries.filter((entry) => entry.applications.length);
  const open = entries.filter((entry) => !entry.applications.length || entry.openQuestion);
  byId('reflection-content').innerHTML = `<div class="reflection-summary"><p><strong>${used.length ? 'Connections to revisit' : 'No links yet'}</strong><br />${used.length ? 'These are observations, not a performance measure.' : 'Add a work-use note when a practised idea shows up naturally.'}</p></div>
    <section><h3>Where practice travelled</h3>${used.length ? `<ul class="reflection-list">${used.flatMap((entry) => entry.applications.map((application) => `<li><strong>${esc(entry.topic)}</strong><span>${esc(application.note)}</span><time datetime="${application.usedOn}">${dateLabel(application.usedOn)}</time></li>`)).join('')}</ul>` : '<p class="muted">The first connection will appear here.</p>'}</section>
    <section><h3>Prompts worth carrying forward</h3>${open.length ? `<ul class="prompt-list">${open.map((entry) => `<li><span>${esc(entry.topic)}</span><q>${esc(entry.retrievalPrompt)}</q>${entry.openQuestion ? `<small>Still open: ${esc(entry.openQuestion)}</small>` : ''}</li>`).join('')}</ul>` : '<p class="muted">Every saved prompt currently has a work-use link.</p>'}</section>
    <section class="reflection-questions"><h3>Write for yourself</h3><ol><li>Which idea changed what you noticed?</li><li>Which prompt still requires lookup?</li><li>What small practice block would test that gap?</li></ol></section>`;
  reviewDialog.showModal();
}

interface LicenseCache { valid: boolean; checkedAt: number; }

async function verifyLicense(token: string, force = false): Promise<void> {
  const status = byId('license-status');
  const cached = JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) || 'null') as LicenseCache | null;
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) {
    unlocked = cached.valid;
    status.textContent = cached.valid ? 'License verified. Your pass is active.' : 'License no longer active. You can buy or restore another license.';
    render();
    return;
  }
  status.textContent = navigator.onLine ? 'Verifying license…' : 'Offline. Using the most recent license check.';
  if (!navigator.onLine) return;
  try {
    const response = await fetch(`${BILLING_BASE}/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const verdict = await response.json() as { valid: boolean };
    unlocked = Boolean(verdict.valid);
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid: unlocked, checkedAt: Date.now() }));
    status.textContent = unlocked ? 'License verified. Your pass is active.' : 'License no longer active. Check the token or buy the pass.';
    render();
  } catch {
    status.textContent = cached?.valid ? 'Could not re-check while offline. Your last verified access remains available.' : 'Could not verify right now. Check your connection and try again.';
  }
}

function initialiseLicense(): void {
  const url = new URL(location.href);
  const returned = url.searchParams.get('license');
  if (returned) {
    localStorage.setItem(LICENSE_KEY, returned);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  const token = returned || localStorage.getItem(LICENSE_KEY);
  const cached = JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) || 'null') as LicenseCache | null;
  unlocked = Boolean(cached?.valid);
  if (token) {
    byId<HTMLInputElement>('license-token').value = token;
    void verifyLicense(token);
  }
}

function updateConnectivity(): void {
  byId('connectivity').hidden = navigator.onLine;
}

document.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button) return;
  if (button.matches('.close-dialog')) button.closest('dialog')?.close();
  if (button.matches('.edit-entry')) openEntry(entries.find((entry) => entry.id === button.dataset.id));
  if (button.matches('.add-application')) openApplication(button.dataset.id!);
  if (button.matches('.delete-entry')) {
    const entry = entries.find((item) => item.id === button.dataset.id);
    if (!entry) return;
    deleteDialog.dataset.id = entry.id;
    byId('delete-description').textContent = `“${entry.topic}” and ${entry.applications.length} linked work-use ${entry.applications.length === 1 ? 'note' : 'notes'} will be removed. This cannot be undone.`;
    deleteDialog.showModal();
  }
  if (button.matches('.remove-application')) {
    const entry = entries.find((item) => item.id === button.dataset.entry);
    if (!entry || !confirm('Remove this work-use note? The practice block will stay.')) return;
    const updated = { ...entry, applications: entry.applications.filter((note) => note.id !== button.dataset.application), updatedAt: new Date().toISOString() };
    await putEntry(updated);
    entries = entries.map((item) => item.id === updated.id ? updated : item);
    render();
    announce('Work-use note removed.');
  }
});

byId('open-entry').addEventListener('click', () => openEntry());
byId('add-from-list').addEventListener('click', () => openEntry());
byId('open-data').addEventListener('click', () => dataDialog.showModal());
byId('footer-data').addEventListener('click', () => dataDialog.showModal());
byId<HTMLSelectElement>('theme').value = storedTheme;
byId<HTMLSelectElement>('theme').addEventListener('change', (event) => {
  const value = (event.target as HTMLSelectElement).value;
  localStorage.setItem(THEME_KEY, value);
  applyTheme(value);
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if ((localStorage.getItem(THEME_KEY) || 'system') === 'system') applyTheme('system'); });
for (const id of ['topic', 'source', 'retrieval-prompt', 'application-note']) {
  byId<HTMLInputElement | HTMLTextAreaElement>(id).addEventListener('input', (event) => {
    (event.currentTarget as HTMLInputElement | HTMLTextAreaElement).setCustomValidity('');
  });
}
byId('previous-week').addEventListener('click', () => { weekStart = moveWeek(weekStart, -1); render(); });
byId('next-week').addEventListener('click', () => { weekStart = moveWeek(weekStart, 1); render(); });
byId('this-week').addEventListener('click', () => { weekStart = startOfWeek(localDate()); render(); });
byId('archive-toggle').addEventListener('click', () => {
  if (!archiveOpen && !unlocked) { dataDialog.showModal(); return; }
  archiveOpen = !archiveOpen;
  render();
});
byId<HTMLFormElement>('entry-form').addEventListener('submit', (event) => { event.preventDefault(); void saveEntry(event.currentTarget as HTMLFormElement); });
byId<HTMLFormElement>('application-form').addEventListener('submit', (event) => { event.preventDefault(); void saveApplication(event.currentTarget as HTMLFormElement); });
byId('confirm-delete').addEventListener('click', async (event) => {
  event.preventDefault();
  const id = deleteDialog.dataset.id;
  if (!id) return;
  try {
    await deleteEntry(id);
    entries = entries.filter((entry) => entry.id !== id);
    deleteDialog.close();
    render();
    announce('Practice block deleted.');
  } catch { announce('The practice block could not be deleted. Try again.'); }
});
byId('export-json').addEventListener('click', () => {
  const bundle: ExportBundle = { product: PRODUCT, version: 1, exportedAt: new Date().toISOString(), entries };
  download(`practice-evidence-${localDate()}.json`, JSON.stringify(bundle, null, 2), 'application/json');
  announce('JSON export prepared.');
});
byId('export-csv').addEventListener('click', () => { download(`practice-evidence-${localDate()}.csv`, toCsv(entries), 'text/csv;charset=utf-8'); announce('CSV export prepared.'); });
byId<HTMLInputElement>('import-json').addEventListener('change', async (event) => {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const bundle = validateBundle(JSON.parse(await file.text()));
    if (!confirm(`Replace the current log with ${bundle.entries.length} imported practice ${bundle.entries.length === 1 ? 'block' : 'blocks'}? Export first if you need a backup.`)) return;
    await replaceEntries(bundle.entries);
    entries = bundle.entries.sort((a, b) => b.practicedOn.localeCompare(a.practicedOn));
    render();
    announce('Import complete. The local log was replaced.');
  } catch (error) {
    announce(error instanceof Error ? error.message : 'The import could not be read.');
  } finally { input.value = ''; }
});
byId<HTMLFormElement>('license-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const token = byId<HTMLInputElement>('license-token').value.trim();
  if (token.length < 8) { byId('license-status').textContent = 'Paste the complete license token from your receipt.'; return; }
  localStorage.setItem(LICENSE_KEY, token);
  void verifyLicense(token, true);
});
byId('print-review').addEventListener('click', () => window.print());
window.addEventListener('online', updateConnectivity);
window.addEventListener('offline', updateConnectivity);

byId('reset-demo')?.addEventListener('click', async () => {
  try {
    entries = sampleEntries();
    await replaceEntries(entries);
    localStorage.setItem(DEMO_SEEDED_KEY, '1');
    weekStart = startOfWeek(localDate());
    archiveOpen = false;
    render();
    announce('Demo reset to the original sample.');
  } catch {
    announce('The demo could not reset. Reload and try again.');
  }
});
byId('start-real')?.addEventListener('click', async () => {
  try {
    await discardDemoDatabase();
    Object.keys(localStorage).filter((key) => key.startsWith('demo:')).forEach((key) => localStorage.removeItem(key));
    location.assign('/');
  } catch (error) {
    announce(error instanceof Error ? error.message : 'The demo could not be cleared.');
  }
});

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    let refreshing = false;
    const registration = await navigator.serviceWorker.register('/sw.js');
    const showUpdate = (worker: ServiceWorker) => {
      const toast = byId<HTMLDivElement>('toast');
      toast.innerHTML = 'An update is ready. <button class="toast-button" type="button">Use it now</button>';
      toast.hidden = false;
      toast.querySelector('button')?.addEventListener('click', () => {
        refreshing = true;
        worker.postMessage({ type: 'SKIP_WAITING' });
      });
    };
    watchForServiceWorkerUpdate(registration, () => Boolean(navigator.serviceWorker.controller), showUpdate);
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) location.reload(); });
  } catch { /* The local app remains usable without install support. */ }
}

async function start(): Promise<void> {
  updateConnectivity();
  initialiseLicense();
  try {
    const stored = await getEntries();
    entries = stored.entries;
    if (stored.invalidCount > 0) {
      const warning = byId('storage-warning');
      warning.hidden = false;
      warning.textContent = `${stored.invalidCount} unreadable ${stored.invalidCount === 1 ? 'record was' : 'records were'} skipped. Export the readable log before clearing site data.`;
    }
    if (DEMO_MODE && !localStorage.getItem(DEMO_SEEDED_KEY)) {
      entries = sampleEntries();
      await replaceEntries(entries);
      localStorage.setItem(DEMO_SEEDED_KEY, '1');
    }
  } catch {
    storageReady = false;
    const warning = byId('storage-warning');
    warning.hidden = false;
    warning.textContent = 'Local storage is unavailable. You can explore the interface, but entries will not survive a refresh. Allow site storage or leave private browsing, then reload.';
  }
  if (!storageReady) document.body.dataset.storageError = 'true';
  render();
  void registerServiceWorker();
}

void start();
