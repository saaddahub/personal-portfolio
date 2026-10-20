// Conditional writes prevent an older tab/device from replacing newer work.
export async function savePortfolioSnapshot(client, data, revision) {
  const row = { id: 'main', data, updated_at: new Date(Math.max(Date.now(), (Date.parse(revision) || 0) + 1)).toISOString() };
  const query = revision
    ? client.from('portfolio_content').update(row).eq('id', 'main').eq('updated_at', revision)
    : client.from('portfolio_content').insert(row);
  const { data: saved, error } = await query.select('updated_at').maybeSingle();
  if (error) throw error;
  if (!saved) throw new Error('Another tab or device updated your portfolio. Export your draft, reload, and review before saving again.');
  return saved.updated_at;
}

export function readRecoveryDraft(storage, current, normalize) {
  for (const key of ['saad_portfolio_pending_v2', 'saad_portfolio_cms_data_v1']) {
    try {
      if (key.endsWith('_v1') && storage.getItem('saad_portfolio_legacy_reviewed_v2')) continue;
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const data = normalize(key.endsWith('_v2') ? parsed.data : parsed);
      if (JSON.stringify(data) !== JSON.stringify(current)) return data;
    } catch { /* Preserve invalid/unavailable storage; never erase it on load. */ }
  }
  return null;
}
