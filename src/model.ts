import type { ExportBundle, PracticeEntry } from './types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE_TIME_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}

function isNonBlankString(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

export function isPracticeEntry(value: unknown): value is PracticeEntry {
  if (!isPlainObject(value)
    || !isNonBlankString(value.id, 200)
    || !isValidDate(value.practicedOn)
    || !isNonBlankString(value.topic, 100)
    || typeof value.minutes !== 'number'
    || !Number.isInteger(value.minutes)
    || value.minutes < 10
    || value.minutes > 60
    || value.minutes % 5 !== 0
    || !isNonBlankString(value.source, 240)
    || !isNonBlankString(value.retrievalPrompt, 500)
    || typeof value.openQuestion !== 'string'
    || value.openQuestion.length > 500
    || !isIsoDateTime(value.createdAt)
    || !isIsoDateTime(value.updatedAt)
    || !Array.isArray(value.applications)) return false;

  const practicedOn = value.practicedOn;
  return value.applications.every((application) => isPlainObject(application)
    && isNonBlankString(application.id, 200)
    && isValidDate(application.usedOn)
    && application.usedOn >= practicedOn
    && isNonBlankString(application.note, 600)
    && isIsoDateTime(application.createdAt));
}

export function localDate(input = new Date()): string {
  const offset = input.getTimezoneOffset() * 60_000;
  return new Date(input.getTime() - offset).toISOString().slice(0, 10);
}

export function startOfWeek(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return localDate(date);
}

export function moveWeek(dateString: string, amount: number): string {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount * 7);
  return startOfWeek(localDate(date));
}

export function weekContains(weekStart: string, dateString: string): boolean {
  const start = new Date(`${weekStart}T00:00:00`).getTime();
  const value = new Date(`${dateString}T12:00:00`).getTime();
  return value >= start && value < start + 7 * 86_400_000;
}

export function formatWeek(weekStart: string): string {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const month = new Intl.DateTimeFormat(undefined, { month: 'short' });
  const left = `${month.format(start)} ${start.getDate()}`;
  const right = `${month.format(end)} ${end.getDate()}, ${end.getFullYear()}`;
  return `${left}–${right}`;
}

export function isWebSource(source: string): boolean {
  try {
    const url = new URL(source);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateBundle(value: unknown): ExportBundle {
  if (!isPlainObject(value)) throw new Error('This file is not a Practice Evidence Log export.');
  const candidate = value as Partial<ExportBundle>;
  if (candidate.product !== 'work-study-evidence-log'
    || candidate.version !== 1
    || !isIsoDateTime(candidate.exportedAt)
    || !Array.isArray(candidate.entries)) {
    throw new Error('Choose a version 1 JSON export from Practice Evidence Log.');
  }
  for (const entry of candidate.entries) {
    if (!isPracticeEntry(entry)) {
      throw new Error('The export contains an incomplete or invalid practice entry.');
    }
  }
  return candidate as ExportBundle;
}

function csvCell(value: string | number): string {
  const raw = String(value);
  const neutral = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  const safe = neutral.replaceAll('"', '""');
  return `"${safe}"`;
}

export function toCsv(entries: PracticeEntry[]): string {
  const rows = [['practice_date', 'topic', 'minutes', 'source', 'retrieval_prompt', 'open_question', 'used_on', 'work_use_note']];
  for (const entry of entries) {
    if (entry.applications.length === 0) {
      rows.push([entry.practicedOn, entry.topic, String(entry.minutes), entry.source, entry.retrievalPrompt, entry.openQuestion, '', '']);
    } else {
      for (const application of entry.applications) {
        rows.push([entry.practicedOn, entry.topic, String(entry.minutes), entry.source, entry.retrievalPrompt, entry.openQuestion, application.usedOn, application.note]);
      }
    }
  }
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}
