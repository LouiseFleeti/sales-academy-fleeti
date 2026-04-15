export type NotionRelation = {
  id: string;
  name: string;
};

export type Industry = {
  id: string;
  name: string;
  typeIndustrie?: string;
  description?: string;
  typeFlotte?: string;
  operationsTerrain?: string;
  painPoints: NotionRelation[];
};

export type Enjeu = {
  id: string;
  name: string;
  description?: string;
  painpointsAssocies: NotionRelation[];
  solutionsAssociees: NotionRelation[];
  fonctionnalitesAssociees: NotionRelation[];
  industriesConcernees: NotionRelation[];
};

export type PainPoint = {
  id: string;
  name: string;
  descriptionTerrain?: string;
  categorie?: string;
  frequence?: string;
  consequenceBusiness?: string;
  questionStrategique?: string;
  symptomes?: string;
  industriesConcernees: NotionRelation[];
  capacitesProduit: NotionRelation[];
  enjeuBusiness: NotionRelation[];
  personas: NotionRelation[];
  solutions: NotionRelation[];
};

export type Solution = {
  id: string;
  name: string;
  description?: string;
  painPointsResolus: NotionRelation[];
  benefices: NotionRelation[];
  capacitesProduit: NotionRelation[];
  enjeuBusiness: NotionRelation[];
  fonctionnalites: NotionRelation[];
};

export type Capacite = {
  id: string;
  name: string;
  description?: string;
  solutionsAssociees: NotionRelation[];
  modulesAssocies: NotionRelation[];
  painPointsLies: NotionRelation[];
};

export type Fonctionnalite = {
  id: string;
  name: string;
  descriptionTerrain?: string;
  categorie?: string;
  type?: string;
  solutionsAssociees: NotionRelation[];
  capacitesProduit: NotionRelation[];
  enjeuBusiness: NotionRelation[];
};

export type Benefice = {
  id: string;
  name: string;
  description?: string;
  solutionsAssociees: NotionRelation[];
  painPointsLies: NotionRelation[];
  domainerBusiness: NotionRelation[];
};

export type Persona = {
  id: string;
  name: string;
  titre?: string;
  tailleCible?: string;
  objectifPrincipal?: string;
  industries: NotionRelation[];
  painPointsPrincipaux: NotionRelation[];
};

export type TabKey =
  | "industries"
  | "painpoints"
  | "capacites"
  | "chat"
  | "enjeux"
  | "solutions"
  | "fonctionnalites"
  | "benefices"
  | "personas";

export type AnyRecord =
  | Industry
  | Enjeu
  | PainPoint
  | Solution
  | Capacite
  | Fonctionnalite
  | Benefice
  | Persona;
