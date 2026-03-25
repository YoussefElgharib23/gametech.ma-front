export const CONFIGURATOR_CATEGORIES = [
  "PROCESSEUR",
  "CPU COOLER",
  "CARTE MÈRE",
  "Mémoires RAM",
  "CARTE GRAPHIQUE",
  "SSD",
  "HDD",
  "BOITIER GAMER",
  "ALIMENTATION PC (PSU)",
  "SOURIS",
  "CLAVIER",
  "CASQUE",
  "Microphone",
  "COMBO",
  "ECRAN PC",
  "ENCEINTES PC",
  "WEBCAMS",
  "TAPIS SOURIS",
] as const;

export type ConfiguratorCategory = (typeof CONFIGURATOR_CATEGORIES)[number];

