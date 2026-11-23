import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const validator = new URL('./validate-catalog.mjs', import.meta.url);

async function runValidator(payload) {
  const dir = await mkdtemp(join(tmpdir(), 'efootball-catalog-'));
  const file = join(dir, 'catalog.json');
  try {
    await writeFile(file, JSON.stringify(payload), 'utf8');
    return spawnSync(process.execPath, [validator.pathname, file], {
      encoding: 'utf8'
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function baseCatalog() {
  return {
    source: {
      name: 'Test source',
      url: 'https://example.org/dataset',
      reusePermission: 'permitted'
    },
    players: [{
      cardId: 'test-card-001',
      name: 'Test Player',
      pos: 'CF',
      ovr: 90,
      maxOvr: 95,
      source: 'Test source',
      sourceUrl: 'https://example.org/player/test-card-001',
      retrievedAt: '2026-11-23',
      verification: 'verified',
      attributes: {},
      skills: [],
      positions: {}
    }],
    managers: [{
      managerId: 'test-manager-001',
      name: 'Test Manager',
      defensiveLine: 55,
      compactness: 60,
      boosters: [],
      linkUp: [],
      source: 'Test source',
      sourceUrl: 'https://example.org/manager/test-manager-001',
      retrievedAt: '2026-11-23',
      verification: 'verified'
    }]
  };
}

test('accepts a well-formed, permission-cleared test catalogue', async () => {
  const result = await runValidator(baseCatalog());
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /VALIDATION PASSED/);
  assert.match(result.stdout, /Player cards: 1; managers: 1/);
});

test('rejects a source without confirmed reuse permission', async () => {
  const payload = baseCatalog();
  payload.source.reusePermission = 'not_confirmed';
  const result = await runValidator(payload);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /reusePermission/);
});

test('rejects duplicate player card identifiers', async () => {
  const payload = baseCatalog();
  payload.players.push({ ...payload.players[0] });
  const result = await runValidator(payload);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate identifier/);
});

test('rejects impossible overall ratings and malformed dates', async () => {
  const payload = baseCatalog();
  payload.players[0].ovr = 125;
  payload.managers[0].retrievedAt = '2026-02-31';
  const result = await runValidator(payload);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /players\[0\]\.ovr/);
  assert.match(result.stderr, /managers\[0\]\.retrievedAt/);
});
