import test from 'node:test';
import assert from 'node:assert/strict';
import { savePortfolioSnapshot, readRecoveryDraft } from '../src/lib/portfolioPersistence.js';

function database(initial = null) {
  let row = initial;
  return {
    get row() { return row; },
    from() {
      let candidate, insert = false;
      const filters = {};
      const query = {
        insert(value) { candidate = value; insert = true; return query; },
        update(value) { candidate = value; return query; },
        eq(key, value) { filters[key] = value; return query; },
        select() { return query; },
        async maybeSingle() {
          if (insert && row) return { error: new Error('duplicate key') };
          if (!insert && (!row || Object.entries(filters).some(([key, value]) => row[key] !== value))) return { data: null };
          row = structuredClone(candidate);
          return { data: { updated_at: row.updated_at } };
        },
      };
      return query;
    },
  };
}
const storage = entries => ({ getItem: key => entries[key] ?? null });
const normalize = value => { if (!Array.isArray(value.projects)) throw new Error('invalid'); return value; };

test('first save and a subsequent image change survive a fresh read', async () => {
  const db = database();
  const first = await savePortfolioSnapshot(db, { projects: [{ image: 'first.jpg' }] }, null);
  const second = await savePortfolioSnapshot(db, { projects: [{ image: 'second.jpg' }] }, first);
  assert.notEqual(first, second);
  assert.equal(db.row.data.projects[0].image, 'second.jpg');
});
test('stale device cannot overwrite a newer cloud save', async () => {
  const db = database();
  const first = await savePortfolioSnapshot(db, { projects: [] }, null);
  await savePortfolioSnapshot(db, { projects: ['new work'] }, first);
  await assert.rejects(savePortfolioSnapshot(db, { projects: ['stale'] }, first), /Another tab/);
  assert.deepEqual(db.row.data.projects, ['new work']);
});
test('simultaneous first publication cannot replace existing work', async () => {
  const db = database();
  await savePortfolioSnapshot(db, { projects: ['saved'] }, null);
  await assert.rejects(savePortfolioSnapshot(db, { projects: [] }, null), /duplicate/);
  assert.deepEqual(db.row.data.projects, ['saved']);
});
test('failed requests never report a confirmed save', async () => {
  const db = { from() { throw new Error('offline'); } };
  await assert.rejects(savePortfolioSnapshot(db, { projects: [] }, null), /offline/);
});
test('old browser work is recoverable without taking priority over cloud automatically', () => {
  const draft = { projects: ['lost work'] };
  assert.deepEqual(readRecoveryDraft(storage({ saad_portfolio_cms_data_v1: JSON.stringify(draft) }), { projects: [] }, normalize), draft);
  assert.equal(readRecoveryDraft(storage({ saad_portfolio_cms_data_v1: JSON.stringify(draft), saad_portfolio_legacy_reviewed_v2: 'true' }), { projects: [] }, normalize), null);
});
test('pending edits are recovered; matching and malformed backups are ignored', () => {
  const draft = { projects: ['image.jpg'] };
  const saved = storage({ saad_portfolio_pending_v2: JSON.stringify({ data: draft }) });
  assert.deepEqual(readRecoveryDraft(saved, { projects: [] }, normalize), draft);
  assert.equal(readRecoveryDraft(saved, draft, normalize), null);
  assert.equal(readRecoveryDraft(storage({ saad_portfolio_pending_v2: '{' }), draft, normalize), null);
});
