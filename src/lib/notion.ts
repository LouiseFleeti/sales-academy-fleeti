import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type {
  Industry,
  Enjeu,
  PainPoint,
  Solution,
  Capacite,
  Fonctionnalite,
  Benefice,
  Persona,
  NotionRelation,
} from "@/types/notion";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const REVALIDATE = 600; // 10 minutes

// ─── Cache en mémoire (durée de vie du process serveur) ─────────────────────
const pageNameCache = new Map<string, string>();

// ─── Helpers ────────────────────────────────────────────────────────────────

function getText(page: PageObjectResponse, prop: string): string | undefined {
  const p = page.properties[prop];
  if (!p) return undefined;
  if (p.type === "rich_text") return p.rich_text.map((r) => r.plain_text).join("") || undefined;
  if (p.type === "title") return p.title.map((r) => r.plain_text).join("") || undefined;
  if (p.type === "select") return p.select?.name || undefined;
  if (p.type === "multi_select") return p.multi_select.map((s) => s.name).join(", ") || undefined;
  if (p.type === "url") return p.url || undefined;
  return undefined;
}

function getRelationIds(page: PageObjectResponse, prop: string): string[] {
  const p = page.properties[prop];
  if (!p || p.type !== "relation") return [];
  return p.relation.map((r) => r.id);
}

async function resolvePageName(id: string): Promise<string | null> {
  // Vérifie le cache d'abord
  if (pageNameCache.has(id)) return pageNameCache.get(id)!;
  try {
    const page = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse;
    const name = getPageName(page);
    pageNameCache.set(id, name);
    return name;
  } catch {
    return null;
  }
}

async function resolveRelations(ids: string[]): Promise<NotionRelation[]> {
  if (ids.length === 0) return [];
  // Tous les appels en parallèle
  const results = await Promise.all(ids.map(async (id) => {
    const name = await resolvePageName(id);
    return name ? { id, name } : null;
  }));
  return results.filter(Boolean) as NotionRelation[];
}

function getPageName(page: PageObjectResponse): string {
  for (const [, prop] of Object.entries(page.properties)) {
    if (prop.type === "title") {
      return prop.title.map((r) => r.plain_text).join("") || "Sans nom";
    }
  }
  return "Sans nom";
}

async function queryAll(databaseId: string): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;
  do {
    const res: QueryDatabaseResponse = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...(res.results as PageObjectResponse[]));
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

// ─── Industries ─────────────────────────────────────────────────────────────

export async function getIndustries(): Promise<Industry[]> {
  const pages = await queryAll(process.env.NOTION_DB_INDUSTRIES!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Name") || getText(p, "Nom") || "Sans nom",
      typeIndustrie: getText(p, "Type d'industrie"),
      description: getText(p, "Description"),
      typeFlotte: getText(p, "Type de flotte"),
      operationsTerrain: getText(p, "Opérations terrain"),
      painPoints: await resolveRelations(getRelationIds(p, "Pain points")),
    }))
  );
}

export async function getIndustry(id: string): Promise<Industry | null> {
  try {
    const p = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse;
    return {
      id: p.id,
      name: getText(p, "Name") || getText(p, "Nom") || "Sans nom",
      typeIndustrie: getText(p, "Type d'industrie"),
      description: getText(p, "Description"),
      typeFlotte: getText(p, "Type de flotte"),
      operationsTerrain: getText(p, "Opérations terrain"),
      painPoints: await resolveRelations(getRelationIds(p, "Pain points")),
    };
  } catch {
    return null;
  }
}

// ─── Enjeux Business ────────────────────────────────────────────────────────

export async function getEnjeux(): Promise<Enjeu[]> {
  const pages = await queryAll(process.env.NOTION_DB_ENJEUX!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      description: getText(p, "Description"),
      painpointsAssocies: await resolveRelations(getRelationIds(p, "Paintpoints associés")),
      solutionsAssociees: await resolveRelations(getRelationIds(p, "Solutions associées")),
      fonctionnalitesAssociees: await resolveRelations(getRelationIds(p, "Fonctionnalités associées")),
      industriesConcernees: await resolveRelations(getRelationIds(p, "Industries concernées")),
    }))
  );
}

export async function getEnjeu(id: string): Promise<Enjeu | null> {
  try {
    const p = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse;
    return {
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      description: getText(p, "Description"),
      painpointsAssocies: await resolveRelations(getRelationIds(p, "Paintpoints associés")),
      solutionsAssociees: await resolveRelations(getRelationIds(p, "Solutions associées")),
      fonctionnalitesAssociees: await resolveRelations(getRelationIds(p, "Fonctionnalités associées")),
      industriesConcernees: await resolveRelations(getRelationIds(p, "Industries concernées")),
    };
  } catch {
    return null;
  }
}

// ─── Pain Points ─────────────────────────────────────────────────────────────

export async function getPainPoints(): Promise<PainPoint[]> {
  const pages = await queryAll(process.env.NOTION_DB_PAINPOINTS!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Nom du pain point") || getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      descriptionTerrain: getText(p, "Description terrain"),
      categorie: getText(p, "Catégorie"),
      frequence: getText(p, "Fréquence"),
      consequenceBusiness: getText(p, "Conséquence business"),
      questionStrategique: getText(p, "Question stratégique"),
      symptomes: getText(p, "Symptomes"),
      industriesConcernees: await resolveRelations(getRelationIds(p, "industries concernées")),
      capacitesProduit: await resolveRelations(getRelationIds(p, "Capacités produit")),
      enjeuBusiness: await resolveRelations(getRelationIds(p, "Enjeu business")),
      personas: await resolveRelations(getRelationIds(p, "Personas")),
      solutions: await resolveRelations(getRelationIds(p, "Solutions")),
    }))
  );
}

export async function getPainPoint(id: string): Promise<PainPoint | null> {
  try {
    const p = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse;
    return {
      id: p.id,
      name: getText(p, "Nom du pain point") || getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      descriptionTerrain: getText(p, "Description terrain"),
      categorie: getText(p, "Catégorie"),
      frequence: getText(p, "Fréquence"),
      consequenceBusiness: getText(p, "Conséquence business"),
      questionStrategique: getText(p, "Question stratégique"),
      symptomes: getText(p, "Symptomes"),
      industriesConcernees: await resolveRelations(getRelationIds(p, "industries concernées")),
      capacitesProduit: await resolveRelations(getRelationIds(p, "Capacités produit")),
      enjeuBusiness: await resolveRelations(getRelationIds(p, "Enjeu business")),
      personas: await resolveRelations(getRelationIds(p, "Personas")),
      solutions: await resolveRelations(getRelationIds(p, "Solutions")),
    };
  } catch {
    return null;
  }
}

// ─── Solutions ───────────────────────────────────────────────────────────────

export async function getSolutions(): Promise<Solution[]> {
  const pages = await queryAll(process.env.NOTION_DB_SOLUTIONS!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      description: getText(p, "Description"),
      painPointsResolus: await resolveRelations(getRelationIds(p, "pain points résolus")),
      benefices: await resolveRelations(getRelationIds(p, "Bénéfices")),
      capacitesProduit: await resolveRelations(getRelationIds(p, "Capacités produit")),
      enjeuBusiness: await resolveRelations(getRelationIds(p, "Enjeu business")),
      fonctionnalites: await resolveRelations(getRelationIds(p, "Fonctionnalités")),
    }))
  );
}

export async function getSolution(id: string): Promise<Solution | null> {
  try {
    const p = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse;
    return {
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      description: getText(p, "Description"),
      painPointsResolus: await resolveRelations(getRelationIds(p, "pain points résolus")),
      benefices: await resolveRelations(getRelationIds(p, "Bénéfices")),
      capacitesProduit: await resolveRelations(getRelationIds(p, "Capacités produit")),
      enjeuBusiness: await resolveRelations(getRelationIds(p, "Enjeu business")),
      fonctionnalites: await resolveRelations(getRelationIds(p, "Fonctionnalités")),
    };
  } catch {
    return null;
  }
}

// ─── Capacités produit ────────────────────────────────────────────────────────

export async function getCapacites(): Promise<Capacite[]> {
  const pages = await queryAll(process.env.NOTION_DB_CAPACITES!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      description: getText(p, "Description"),
      solutionsAssociees: await resolveRelations(getRelationIds(p, "Solutions associées")),
      modulesAssocies: await resolveRelations(getRelationIds(p, "Modules associés")),
      painPointsLies: await resolveRelations(getRelationIds(p, "Pain points liés")),
    }))
  );
}

export async function getCapacite(id: string): Promise<Capacite | null> {
  try {
    const p = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse;
    return {
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      description: getText(p, "Description"),
      solutionsAssociees: await resolveRelations(getRelationIds(p, "Solutions associées")),
      modulesAssocies: await resolveRelations(getRelationIds(p, "Modules associés")),
      painPointsLies: await resolveRelations(getRelationIds(p, "Pain points liés")),
    };
  } catch {
    return null;
  }
}

// ─── Fonctionnalités ──────────────────────────────────────────────────────────

export async function getFonctionnalites(): Promise<Fonctionnalite[]> {
  const pages = await queryAll(process.env.NOTION_DB_FONCTIONNALITES!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Name") || getText(p, "Nom") || "Sans nom",
      descriptionTerrain: getText(p, "Description terrain"),
      categorie: getText(p, "Catégorie"),
      type: getText(p, "Type"),
      solutionsAssociees: await resolveRelations(getRelationIds(p, "Solutions associées")),
      capacitesProduit: await resolveRelations(getRelationIds(p, "Capacités produit")),
      enjeuBusiness: await resolveRelations(getRelationIds(p, "Enjeu business")),
    }))
  );
}

// ─── Bénéfices ────────────────────────────────────────────────────────────────

export async function getBenefices(): Promise<Benefice[]> {
  const pages = await queryAll(process.env.NOTION_DB_BENEFICES!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      description: getText(p, "Description"),
      solutionsAssociees: await resolveRelations(getRelationIds(p, "Solutions associées")),
      painPointsLies: await resolveRelations(getRelationIds(p, "Pain points liés")),
      domainerBusiness: await resolveRelations(getRelationIds(p, "Domaines business")),
    }))
  );
}

// ─── Personas ─────────────────────────────────────────────────────────────────

export async function getPersonas(): Promise<Persona[]> {
  const pages = await queryAll(process.env.NOTION_DB_PERSONAS!);
  return Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      name: getText(p, "Nom") || getText(p, "Name") || "Sans nom",
      titre: getText(p, "Titre"),
      tailleCible: getText(p, "Taille Cible"),
      objectifPrincipal: getText(p, "Objectif principal"),
      industries: await resolveRelations(getRelationIds(p, "Industries")),
      painPointsPrincipaux: await resolveRelations(getRelationIds(p, "Pain points principaux")),
    }))
  );
}

// ─── Context builder for Chat ────────────────────────────────────────────────

export async function buildChatContext(query: string): Promise<string> {
  const q = query.toLowerCase();
  const parts: string[] = [];

  const includes = (keywords: string[]) => keywords.some((k) => q.includes(k));

  if (includes(["industrie", "secteur", "flotte", "transport", "logistique", "mine", "btp", "agri"])) {
    const data = await getIndustries();
    parts.push("## Industries cibles\n" + data.map((i) =>
      `**${i.name}**${i.typeIndustrie ? ` (${i.typeIndustrie})` : ""}: ${i.description || ""}`
    ).join("\n"));
  }

  if (includes(["pain point", "problème", "douleur", "terrain", "chauffeur", "opérat"])) {
    const data = await getPainPoints();
    parts.push("## Pain points\n" + data.map((p) =>
      `**${p.name}** [${p.categorie || ""}]: ${p.descriptionTerrain || ""}`
    ).join("\n"));
  }

  if (includes(["solution", "réponse", "résout", "traitement"])) {
    const data = await getSolutions();
    parts.push("## Solutions\n" + data.map((s) =>
      `**${s.name}**: ${s.description || ""}`
    ).join("\n"));
  }

  if (includes(["capacité", "fonctionnalité", "feature", "module", "produit"])) {
    const cap = await getCapacites();
    parts.push("## Capacités produit\n" + cap.map((c) =>
      `**${c.name}**: ${c.description || ""}`
    ).join("\n"));
  }

  if (includes(["bénéfice", "valeur", "avantage", "roi", "retour"])) {
    const data = await getBenefices();
    parts.push("## Bénéfices\n" + data.map((b) =>
      `**${b.name}**: ${b.description || ""}`
    ).join("\n"));
  }

  if (includes(["persona", "décideur", "directeur", "responsable", "acheteur"])) {
    const data = await getPersonas();
    parts.push("## Personas\n" + data.map((p) =>
      `**${p.name}** – ${p.titre || ""}: ${p.objectifPrincipal || ""}`
    ).join("\n"));
  }

  if (includes(["enjeu", "business", "stratégique", "objectif", "priorité"])) {
    const data = await getEnjeux();
    parts.push("## Enjeux business\n" + data.map((e) =>
      `**${e.name}**: ${e.description || ""}`
    ).join("\n"));
  }

  // Default: load pain points + solutions as general context
  if (parts.length === 0) {
    const [pp, sol] = await Promise.all([getPainPoints(), getSolutions()]);
    parts.push("## Pain points\n" + pp.map((p) => `**${p.name}**: ${p.descriptionTerrain || ""}`).join("\n"));
    parts.push("## Solutions\n" + sol.map((s) => `**${s.name}**: ${s.description || ""}`).join("\n"));
  }

  return parts.join("\n\n");
}

export { REVALIDATE };
