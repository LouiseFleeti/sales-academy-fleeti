// Cache côté client — persiste pendant toute la session (navigation SPA)
// Évite de re-fetcher les données Notion à chaque changement d'onglet

const cache = new Map<string, { data: unknown; fetchedAt: number }>();
const TTL_MS = 10 * 60 * 1000; // 10 minutes (cohérent avec le revalidate serveur)

export async function cachedFetch<T>(url: string): Promise<T> {
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && now - cached.fetchedAt < TTL_MS) {
    return cached.data as T;
  }

  const res = await fetch(url);
  const data = await res.json();
  cache.set(url, { data, fetchedAt: now });
  return data as T;
}
