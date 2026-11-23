#!/usr/bin/env node
/**
 * Validate eFootball catalog JSON before any database import.
 * Dry-run only: this script never connects to Supabase or changes data.
 *
 * Usage:
 *   node scripts/validate-catalog.mjs path/to/catalog.json
 *
 * Accepted input:
 * {
 *   "source": {
 *     "name": "Dataset name",
 *     "url": "https://example.org/dataset",
 *     "reusePermission": "permitted"
 *   },
 *   "players": [ ...player cards... ],
 *   "managers": [ ...managers... ]
 * }
 */
import { readFile } from 'node:fs/promises';

const POSITIONS = new Set([
  'GK','CB','LB','RB','DMF','CMF','AMF','LMF','RMF','LWF','RWF','SS','CF'
]);
const VERIFICATION = new Set(['verified','partial','unverified']);
const PERMISSIONS = new Set(['permitted','user_provided']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const errors = [];
const warnings = [];

function error(path, message) { errors.push({ path, message }); }
function warning(path, message) { warnings.push({ path, message }); }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function validDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
}
function validHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch { return false; }
}
function checkRange(value, min, max, path) {
  if (value !== null && value !== undefined &&
      (!Number.isInteger(value) || value < min || value > max)) {
    error(path, `must be an integer from ${min} to ${max} or null`);
  }
}
function checkSource(record, path, type) {
  if (!nonEmpty(record.source)) error(path + '.source', 'is required');
  if (!validHttpUrl(record.sourceUrl)) error(path + '.sourceUrl', 'must be a valid http(s) URL');
  if (!validDate(record.retrievedAt)) error(path + '.retrievedAt', 'must be a real YYYY-MM-DD date');
  if (!VERIFICATION.has(record.verification)) error(path + '.verification', 'must be verified, partial, or unverified');
  if (record.verification === 'verified' && (!nonEmpty(record.source) || !validHttpUrl(record.sourceUrl))) {
    error(path + '.verification', 'verified records require a traceable source URL');
  }
  if (type === 'player' && !nonEmpty(record.cardId)) error(path + '.cardId', 'is required');
  if (type === 'manager' && !nonEmpty(record.managerId)) error(path + '.managerId', 'is required');
}
function checkUnique(records, key, label) {
  const seen = new Set();
  records.forEach((record, i) => {
    const id = record?.[key];
    if (!nonEmpty(id)) return;
    if (seen.has(id)) error(`${label}[${i}].${key}`, `duplicate identifier: ${id}`);
    seen.add(id);
  });
}

let input;
try {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node scripts/validate-catalog.mjs <catalog.json>');
  input = JSON.parse(await readFile(file, 'utf8'));
} catch (e) {
  console.error('Could not read catalog JSON:', e.message);
  process.exit(2);
}

if (!isObject(input)) error('$', 'root must be a JSON object');
const source = input?.source;
if (!isObject(source)) {
  error('source', 'source metadata object is required');
} else {
  if (!nonEmpty(source.name)) error('source.name', 'is required');
  if (!validHttpUrl(source.url)) error('source.url', 'must be a valid http(s) URL');
  if (!PERMISSIONS.has(source.reusePermission)) {
    error('source.reusePermission', 'must be permitted or user_provided before import');
  }
}

const players = input?.players ?? [];
const managers = input?.managers ?? [];
if (!Array.isArray(players)) error('players', 'must be an array');
if (!Array.isArray(managers)) error('managers', 'must be an array');

if (Array.isArray(players)) {
  checkUnique(players, 'cardId', 'players');
  players.forEach((p, i) => {
    const path = `players[${i}]`;
    if (!isObject(p)) { error(path, 'must be an object'); return; }
    if (!nonEmpty(p.name)) error(path + '.name', 'is required');
    if (!POSITIONS.has(p.pos)) error(path + '.pos', 'must be a supported eFootball position');
    checkRange(p.ovr, 1, 110, path + '.ovr');
    checkRange(p.maxOvr, 1, 110, path + '.maxOvr');
    if (p.ovr != null && p.maxOvr != null && p.ovr > p.maxOvr) {
      error(path + '.ovr', 'cannot exceed maxOvr');
    }
    if (p.releaseDate != null && !validDate(p.releaseDate)) error(path + '.releaseDate', 'must be YYYY-MM-DD or null');
    if (p.attributes != null && !isObject(p.attributes)) {
      error(path + '.attributes', 'must be an object');
    } else if (isObject(p.attributes)) {
      for (const [key, value] of Object.entries(p.attributes)) {
        if (value !== null && (!Number.isFinite(value) || value < 0 || value > 110)) {
          error(path + '.attributes.' + key, 'must be a number from 0 to 110 or null');
        }
      }
    }
    if (p.skills != null && (!Array.isArray(p.skills) || p.skills.some(x => !nonEmpty(x)))) {
      error(path + '.skills', 'must be an array of non-empty strings');
    }
    if (p.positions != null && !isObject(p.positions)) {
      error(path + '.positions', 'must be an object');
    } else if (isObject(p.positions)) {
      for (const [key, value] of Object.entries(p.positions)) {
        if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) {
          error(path + '.positions.' + key, 'must be a number from 0 to 100 or null');
        }
      }
    }
    if (p.age != null) checkRange(p.age, 1, 100, path + '.age');
    if (p.height != null) checkRange(p.height, 100, 250, path + '.height');
    if (p.weight != null) checkRange(p.weight, 30, 250, path + '.weight');
    if (p.foot != null && p.foot !== '' && !['Right','Left','Both'].includes(p.foot)) {
      error(path + '.foot', 'must be Right, Left, Both, or empty');
    }
    checkSource(p, path, 'player');
    if (p.verification !== 'verified') warning(path, 'not verified; keep unpublished until checked');
  });
}

if (Array.isArray(managers)) {
  checkUnique(managers, 'managerId', 'managers');
  managers.forEach((m, i) => {
    const path = `managers[${i}]`;
    if (!isObject(m)) { error(path, 'must be an object'); return; }
    if (!nonEmpty(m.name)) error(path + '.name', 'is required');
    if (m.defensiveLine != null && (typeof m.defensiveLine !== 'number' || m.defensiveLine < 0 || m.defensiveLine > 100)) {
      error(path + '.defensiveLine', 'must be a number from 0 to 100 or null');
    }
    if (m.compactness != null && (typeof m.compactness !== 'number' || m.compactness < 0 || m.compactness > 100)) {
      error(path + '.compactness', 'must be a number from 0 to 100 or null');
    }
    for (const key of ['boosters','linkUp']) {
      if (m[key] != null && !Array.isArray(m[key])) error(path + '.' + key, 'must be an array');
    }
    checkSource(m, path, 'manager');
    if (m.verification !== 'verified') warning(path, 'not verified; keep unpublished until checked');
  });
}

if (errors.length) {
  console.error(`VALIDATION FAILED: ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const item of errors) console.error(`ERROR ${item.path}: ${item.message}`);
  for (const item of warnings) console.warn(`WARN  ${item.path}: ${item.message}`);
  process.exit(1);
}
console.log('VALIDATION PASSED');
console.log(`Player cards: ${players.length}; managers: ${managers.length}`);
console.log(`Warnings: ${warnings.length}`);
for (const item of warnings) console.warn(`WARN  ${item.path}: ${item.message}`);
console.log('Dry-run only. No Supabase connection or database writes were performed.');
