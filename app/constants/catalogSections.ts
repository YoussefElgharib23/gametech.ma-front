export const CATALOG_SECTIONS = [
  { slug: "nouvel-arrivage", label: "Nouvel arrivage" },
  { slug: "meilleures-ventes", label: "Meilleures ventes" },
  { slug: "promotion", label: "Promotion" },
] as const;

export const CATALOG_SECTION_SLUGS = ["nouvel-arrivage", "meilleures-ventes", "promotion"] as const;

export type CatalogSectionSlug = (typeof CATALOG_SECTION_SLUGS)[number];

