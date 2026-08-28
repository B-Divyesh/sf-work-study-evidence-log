import { describe, expect, it } from 'vitest';
import { isPracticeEntry, moveWeek, startOfWeek, toCsv, validateBundle, weekContains } from '../src/model';
import type { PracticeEntry } from '../src/types';

const entry: PracticeEntry = {
  id: 'entry-1',
  practicedOn: '2026-08-27',
  topic: 'TCP retransmission',
  minutes: 30,
  source: 'TCP/IP Illustrated',
  retrievalPrompt: 'What separates loss from delay?',
  openQuestion: 'How does the timer adapt?',
  applications: [{ id: 'use-1', usedOn: '2026-08-28', note: 'Recognised a retry pattern.', createdAt: '2026-08-28T10:00:00Z' }],
  createdAt: '2026-08-27T10:00:00Z',
  updatedAt: '2026-08-28T10:00:00Z'
};

describe('weekly model', () => {
  it('uses Monday as the beginning of the week', () => {
    expect(startOfWeek('2026-08-27')).toBe('2026-08-24');
    expect(weekContains('2026-08-24', '2026-08-30')).toBe(true);
    expect(weekContains('2026-08-24', '2026-08-31')).toBe(false);
    expect(moveWeek('2026-08-24', -1)).toBe('2026-08-17');
  });
});

describe('portable data', () => {
  it('creates one CSV row per application link', () => {
    const csv = toCsv([entry]);
    expect(csv).toContain('"TCP retransmission"');
    expect(csv).toContain('"Recognised a retry pattern."');
    expect(csv.split('\n')).toHaveLength(2);
  });

  it('neutralises spreadsheet formula prefixes', () => {
    expect(toCsv([{ ...entry, topic: '=IMPORTXML("bad")' }])).toContain('"\'=IMPORTXML(""bad"")"');
  });

  it('accepts a product export and rejects unrelated JSON', () => {
    const bundle = { product: 'work-study-evidence-log', version: 1, exportedAt: new Date().toISOString(), entries: [entry] } as const;
    expect(validateBundle(bundle).entries).toHaveLength(1);
    expect(() => validateBundle({ entries: [] })).toThrow(/version 1 JSON export/);
  });

  it('rejects incomplete entries before an import can replace valid data', () => {
    const bundle = { product: 'work-study-evidence-log', version: 1, exportedAt: '2026-08-28T10:00:00Z', entries: [{
      id: 'broken', practicedOn: '2026-08-28', topic: 'Looks valid', minutes: 30,
      openQuestion: '', applications: [], createdAt: '2026-08-28T10:00:00Z', updatedAt: '2026-08-28T10:00:00Z'
    }] };
    expect(() => validateBundle(bundle)).toThrow(/incomplete or invalid practice entry/);
  });

  it('rejects blank required text and work use before practice', () => {
    expect(isPracticeEntry({ ...entry, topic: '   ' })).toBe(false);
    expect(isPracticeEntry({ ...entry, source: '\t' })).toBe(false);
    expect(isPracticeEntry({ ...entry, retrievalPrompt: '\n' })).toBe(false);
    expect(isPracticeEntry({ ...entry, applications: [{ ...entry.applications[0], usedOn: '2026-08-26' }] })).toBe(false);
  });
});
