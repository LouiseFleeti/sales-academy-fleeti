export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { dataExists } = await import('@/lib/dataStore');
  const { default: syncAll } = await import('@/lib/syncAll');

  const exists = await dataExists('industries');
  if (!exists) {
    console.log('[startup] Données absentes → sync automatique depuis Notion...');
    await syncAll();
  } else {
    console.log('[startup] Données JSON présentes ✓');
  }
}
