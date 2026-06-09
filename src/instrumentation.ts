export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { dataExists } = await import('@/lib/dataStore');
  const exists = await dataExists('industries');
  if (!exists) {
    console.log('[startup] Données absentes → sync automatique depuis Notion...');
    const { writeData } = await import('@/lib/dataStore');
    const {
      clearDbCache, preloadAllDatabases,
      getIndustries, getEnjeux, getPainPoints, getSolutions,
      getCapacites, getFonctionnalites, getBenefices, getPersonas, getRelances,
    } = await import('@/lib/notion');
    const LOADERS = [
      { key: 'industries', fn: getIndustries },
      { key: 'enjeux', fn: getEnjeux },
      { key: 'painpoints', fn: getPainPoints },
      { key: 'solutions', fn: getSolutions },
      { key: 'capacites', fn: getCapacites },
      { key: 'fonctionnalites', fn: getFonctionnalites },
      { key: 'benefices', fn: getBenefices },
      { key: 'personas', fn: getPersonas },
      { key: 'relances', fn: getRelances },
    ];
    try {
      clearDbCache();
      await preloadAllDatabases();
      for (const { key, fn } of LOADERS) {
        try { await writeData(key, await fn()); console.log('[startup] ✓', key); }
        catch (e) { console.warn('[startup] ✗', key, e); }
      }
      await writeData('sync-meta', { syncedAt: new Date().toISOString() });
      console.log('[startup] Sync automatique terminée ✓');
    } catch (e) {
      console.warn('[startup] Sync automatique échouée :', e);
    }
  } else {
    console.log('[startup] Données JSON présentes ✓');
  }
}
