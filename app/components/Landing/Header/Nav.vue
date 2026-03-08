<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

interface MegaMenuLink {
  label: string;
  to: string;
}

interface MegaMenuSection {
  label: string;
  links: MegaMenuLink[];
}

interface MegaMenuColumn {
  sections: MegaMenuSection[];
}

interface MegaMenuFeature {
  eyebrow: string;
  title: string;
  description: string;
  priceLabel: string;
  to: string;
  ctaLabel: string;
  helperText: string;
  helperLinkLabel: string;
  helperLinkTo: string;
}

const items = ref<DropdownMenuItem[][]>([
  [
    {
      label: "CONFIGURATEUR PC",
      children: [[{ label: "Configurateur PC" }]],
    },
  ],
  [
    {
      label: "PC & ORDINATEUR",
      children: [
        [
          {
            label: "PC Gamer",
            children: [
              [
                { label: "PC Gamer Starter" },
                { label: "PC Gamer Pro" },
                { label: "PC Gamer Extreme" },
                { label: "Ultra PC" },
              ],
            ],
          },
          {
            label: "Powered By MSI",
            children: [
              [
                { label: "Powered By MSI Essential" },
                { label: "Powered By MSI Advanced" },
                { label: "Powered By MSI Ultimate" },
              ],
            ],
          },
          {
            label: "PC Gamer par Jeux",
            children: [
              [
                { label: "GTA V" },
                { label: "PUBG" },
                { label: "Free Fire" },
                { label: "FC 25" },
                { label: "FC 24" },
                { label: "Fortnite" },
                { label: "Call of Duty Warzone" },
                { label: "Apex Legends" },
                { label: "Red Dead" },
              ],
            ],
          },
          {
            label: "PC Professionnel par Logiciel",
            children: [
              [
                { label: "Adobe Premiere Pro" },
                { label: "Adobe After Effects" },
                { label: "Lumion" },
                { label: "3DS Max" },
                { label: "AutoCAD" },
                { label: "ArchiCAD" },
                { label: "Adobe Photoshop" },
                { label: "Adobe Illustrator" },
                { label: "Rhino" },
              ],
            ],
          },
          {
            label: "PC par Prix",
            children: [
              [
                { label: "Moins de 3000 DH" },
                { label: "3000 – 4000 DH" },
                { label: "4000 – 5000 DH" },
                { label: "5000 – 7000 DH" },
                { label: "7000 – 10000 DH" },
                { label: "10000 – 15000 DH" },
                { label: "15000 – 20000 DH" },
                { label: "Plus de 20000 DH" },
              ],
            ],
          },
          {
            label: "PC Professionnel",
            children: [[{ label: "PC Pro" }, { label: "PC Workstation" }]],
          },
          {
            label: "Setup Game",
            children: [
              [
                { label: "Setup PC : PC + Écran" },
                { label: "Setup PC Complet : PC + Souris + Clavier + Écran" },
                {
                  label:
                    "Setup PC Complet : PC + Souris + Clavier + Écran + Chaise + Table",
                },
              ],
            ],
          },
        ],
      ],
    },
  ],
  [
    {
      label: "PC & ORDINATEUR PORTABLE",
      children: [
        [
          { label: "PC Portables Professionnels" },
          { label: "PC Portable Gamer" },
          { label: "PC Portable Bureautique" },
          { label: "PC Portables Remis à Neuf" },
          { label: "Univers Apple – Mac" },
          { label: "Sac & Sacoche & Cartable" },
        ],
      ],
    },
  ],
  [
    {
      label: "COMPOSANTS",
      children: [
        [
          {
            label: "Processeur",
            children: [[{ label: "AMD" }, { label: "Intel" }]],
          },
          {
            label: "Carte Graphique",
            children: [[{ label: "NVIDIA" }, { label: "AMD" }]],
          },
          {
            label: "Carte Mère",
            children: [[{ label: "AMD" }, { label: "Intel" }]],
          },
          {
            label: "Mémoire RAM",
            children: [[{ label: "DIMM" }, { label: "SO-DIMM" }]],
          },
          {
            label: "Boîtier Gamer",
            children: [
              [
                { label: "E-ATX" },
                { label: "ATX" },
                { label: "Micro-ATX" },
                { label: "Mini-ITX" },
              ],
            ],
          },
          {
            label: "Stockage Externe",
            children: [
              [
                { label: "SSD Externe" },
                { label: "HDD Externe" },
                { label: "USB" },
                { label: "Carte SD" },
              ],
            ],
          },
          {
            label: "Alimentation PC (PSU)",
            children: [
              [
                { label: "80+ Bronze" },
                { label: "80+ Gold" },
                { label: "80+ Platinum" },
              ],
            ],
          },
          {
            label: "Stockage Interne",
            children: [[{ label: "HDD" }, { label: "SSD" }]],
          },
          {
            label: "CPU Cooler",
            children: [
              [{ label: "Kits Aircooling" }, { label: "Kits Watercooling" }],
            ],
          },
          {
            label: "Accessoires PC",
            children: [
              [
                { label: "Câble Extension" },
                { label: "Pâte Thermique" },
                { label: "Ventilateurs Boîtier" },
              ],
            ],
          },
          { label: "Serveur NAS" },
        ],
      ],
    },
  ],
  [
    {
      label: "PÉRIPHÉRIQUE PC",
      children: [
        [
          {
            label: "Clavier",
            children: [
              [{ label: "Clavier Bureautique" }, { label: "Clavier Gamer" }],
            ],
          },
          {
            label: "Souris",
            children: [
              [{ label: "Souris Bureautique" }, { label: "Souris Gamer" }],
            ],
          },
          {
            label: "Casque",
            children: [
              [{ label: "Casque Bureautique" }, { label: "Casque Gamer" }],
            ],
          },
          {
            label: "Connectique",
            children: [
              [
                { label: "Câble & Adaptateur Divers" },
                { label: "Hub & Boîtier Disque" },
                { label: "Câble Réseau" },
                { label: "Modem" },
                { label: "Routeur & Point d'accès" },
              ],
            ],
          },
          { label: "Webcams" },
          { label: "Microphone" },
          { label: "Enceintes PC" },
          { label: "Câble Extension" },
          { label: "Kit Gamer" },
          { label: "Onduleur" },
          { label: "Repose Casque" },
          { label: "Tablette Graphique" },
          { label: "Volant & Shifter" },
          { label: "Tapis Souris" },
          { label: "Manettes" },
        ],
      ],
    },
  ],
  [
    {
      label: "ÉCRANS & MONITEURS PC",
      children: [
        [
          { label: "Écran Gamer" },
          { label: "Écran Professionnel" },
          { label: "Écran Interactif" },
        ],
      ],
    },
  ],
  [
    {
      label: "CONSOLES & JEUX & VR",
      children: [
        [
          {
            label: "Console",
            children: [
              [
                { label: "Sony – PlayStation" },
                { label: "Microsoft – Xbox" },
                { label: "Nintendo – Switch" },
                { label: "Lenovo – Legion Go" },
                { label: "Asus – ROG Ally" },
              ],
            ],
          },
          {
            label: "Jeux Vidéo",
            children: [
              [
                { label: "PlayStation" },
                { label: "Xbox" },
                { label: "Nintendo Switch" },
              ],
            ],
          },
          { label: "Accessoires" },
          { label: "VR Réalité Virtuelle" },
        ],
      ],
    },
  ],
  [
    {
      label: "MOBILIER DE BUREAU",
      children: [
        [
          {
            label: "Chaises Bureau",
            children: [[{ label: "Chaises Ergo" }, { label: "Chaises Gamer" }]],
          },
          { label: "Simulateurs de Course" },
          { label: "Tables Bureau" },
          { label: "Porte & Support Écran" },
          { label: "Décoration Lumineuse Nanoleaf" },
          { label: "Figurine & Pop" },
        ],
      ],
    },
  ],
  [
    {
      label: "UNIVERS PHOTO & VIDEO",
      children: [
        [
          { label: "Appareil Photo" },
          { label: "Objectifs" },
          {
            label: "Éclairages & Studio",
            children: [
              [
                { label: "Fond & Supports" },
                { label: "Torches Vidéo" },
                { label: "Trépieds" },
                { label: "Éclairages Continus" },
                { label: "Softbox" },
                { label: "Flash" },
              ],
            ],
          },
          { label: "Son" },
          {
            label: "Stabilisateurs",
            children: [
              [
                { label: "Stabilisateurs Caméras" },
                { label: "Stabilisateurs Téléphones" },
              ],
            ],
          },
          {
            label: "Accessoires Photo",
            children: [
              [
                { label: "Moniteurs Vidéo" },
                { label: "Stockage SD Caméras" },
                { label: "Accessoires Caméras" },
                { label: "Batteries & Chargeurs Caméras" },
                { label: "Bouchons & Pare-soleils" },
                { label: "Sacs Caméras" },
                { label: "Cages" },
              ],
            ],
          },
        ],
      ],
    },
  ],
  [
    {
      label: "LOGICIEL",
      children: [
        [
          { label: "Système d'exploitation" },
          { label: "Antivirus & Sécurité" },
          { label: "Bureautique" },
          { label: "Carte de Recharge Jeux" },
        ],
      ],
    },
  ],
  [
    {
      label: "TV, IMAGE & SON",
      children: [
        [
          {
            label: "TV, Image",
            children: [
              [
                { label: "Téléviseur" },
                { label: "Supports TV" },
                { label: "Android Box" },
                { label: "Projecteurs" },
                { label: "Écrans de Projection" },
                { label: "Récepteur Numérique" },
                { label: "Home Cinéma" },
              ],
            ],
          },
          {
            label: "Son",
            children: [
              [
                { label: "Écouteurs" },
                { label: "Casques" },
                { label: "Enceintes / Haut-Parleurs" },
              ],
            ],
          },
        ],
      ],
    },
  ],
  [
    {
      label: "IMPRIMANTE & SCANNER & TRACEUR",
      children: [
        [
          {
            label: "Imprimante",
            children: [
              [
                { label: "Imprimante à Réservoir Rechargeable" },
                { label: "Multifonction Jet d'Encre" },
                { label: "Imprimante Laser Couleur" },
                { label: "Imprimante Jet d'Encre" },
                { label: "Imprimante Laser Monochrome" },
                { label: "Multifonction Laser Monochrome" },
                { label: "Traceur" },
                { label: "Imprimante Matricielle" },
                { label: "Étiqueteuse & Imprimante Tickets" },
              ],
            ],
          },
          {
            label: "Scanner",
            children: [
              [
                { label: "Scanner à Plat sans Chargeur" },
                { label: "Scanner à Défilement" },
                { label: "Scanner à Plat avec Chargeur Automatique" },
              ],
            ],
          },
          {
            label: "Consommables",
            children: [
              [
                { label: "Cartouche d'Encre" },
                { label: "Toner" },
                { label: "Ruban" },
                { label: "Bouteille d'Encre" },
                { label: "Tête d'Impression" },
              ],
            ],
          },
        ],
      ],
    },
  ],
  [
    {
      label: "ACCESSOIRES & GADGET",
      children: [
        [
          { label: "Smart Watch" },
          { label: "Écouteurs" },
          { label: "Powerbank" },
          { label: "Chargeur" },
          { label: "Câble" },
          { label: "Caméra de Surveillance" },
        ],
      ],
    },
  ],
]);

const megaMenuColumns = ref<MegaMenuColumn[]>([
  {
    sections: [
      {
        label: "PC & Ordinateur",
        links: [
          { label: "PC Gamer", to: "#" },
          { label: "PC Professionnel", to: "#" },
          { label: "PC par jeu", to: "#" },
          { label: "PC par budget", to: "#" },
        ],
      },
      {
        label: "PC Portables & Mac",
        links: [
          { label: "PC Portables Gamer", to: "#" },
          { label: "PC Portables Professionnels", to: "#" },
          { label: "Mac & Univers Apple", to: "#" },
        ],
      },
    ],
  },
  {
    sections: [
      {
        label: "Composants",
        links: [
          { label: "Processeurs", to: "#" },
          { label: "Cartes graphiques", to: "#" },
          { label: "Cartes mères", to: "#" },
          { label: "Mémoire RAM", to: "#" },
          { label: "Stockage", to: "#" },
        ],
      },
      {
        label: "Périphériques",
        links: [
          { label: "Claviers & Souris", to: "#" },
          { label: "Casques & Audio", to: "#" },
          { label: "Webcams & Micro", to: "#" },
          { label: "Tapis & Accessoires", to: "#" },
        ],
      },
    ],
  },
  {
    sections: [
      {
        label: "Composants (sélection)",
        links: [
          { label: "Processeurs", to: "#" },
          { label: "Cartes graphiques", to: "#" },
          { label: "Cartes mères", to: "#" },
          { label: "Mémoire RAM", to: "#" },
          { label: "Stockage", to: "#" },
        ],
      },
      {
        label: "Périphériques (sélection)",
        links: [
          { label: "Claviers & Souris", to: "#" },
          { label: "Casques & Audio", to: "#" },
          { label: "Webcams & Micro", to: "#" },
          { label: "Tapis & Accessoires", to: "#" },
        ],
      },
    ],
  },
]);

const megaMenuFeature = ref<MegaMenuFeature>({
  eyebrow: "En avant",
  title: "AMD Ryzen 9 5950X",
  description:
    "16 cœurs, 32 threads, idéal pour le gaming intensif et la création de contenu.",
  priceLabel: "4 999 MAD",
  to: "/products/amd-ryzen-9-5950x",
  ctaLabel: "Voir la fiche produit",
  helperText: "Explorez tout notre catalogue par catégorie.",
  helperLinkLabel: "Voir tous les produits →",
  helperLinkTo: "/products",
});
</script>

<template>
  <UPopover
    :content="{
      align: 'start',
      side: 'bottom',
      sideOffset: 8,
    }"
    :ui="{ content: 'w-[960px] max-w-[90vw] p-4' }"
    arrow
  >
    <UButton
      icon="i-lucide-menu"
      color="secondary"
      label="Tous nos produits"
      variant="solid"
      class="rounded-none py-3 font-semibold uppercase cursor-pointer"
    />

    <template #content>
      <div class="grid grid-cols-3 gap-6">
        <div
          v-for="(column, columnIndex) in megaMenuColumns"
          :key="columnIndex"
          class="space-y-3"
        >
          <div
            v-for="(section, sectionIndex) in column.sections"
            :key="section.label"
            :class="sectionIndex ? 'mt-4 space-y-1.5' : 'space-y-1.5'"
          >
            <p class="text-xs font-semibold uppercase text-neutral-500">
              {{ section.label }}
            </p>
            <ul class="space-y-1.5 text-sm">
              <li v-for="link in section.links" :key="link.label">
                <NuxtLink :to="link.to" class="hover:text-primary-700">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="col-span-3 rounded-xl bg-neutral-100/80 border border-neutral-200 p-4 flex flex-col justify-between gap-3"
        >
          <div>
            <p class="text-xs font-semibold uppercase text-neutral-500 mb-1">
              {{ megaMenuFeature.eyebrow }}
            </p>
            <p class="text-sm font-semibold mb-1">
              {{ megaMenuFeature.title }}
            </p>
            <p class="text-xs text-neutral-600 mb-3">
              {{ megaMenuFeature.description }}
            </p>
          </div>

          <div class="flex items-center justify-between gap-3">
            <p class="text-lg font-bold text-primary-700">
              {{ megaMenuFeature.priceLabel }}
            </p>
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              :label="megaMenuFeature.ctaLabel"
              :to="megaMenuFeature.to"
            />
          </div>

          <div
            class="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center"
          >
            <span class="text-[11px] text-neutral-500">
              {{ megaMenuFeature.helperText }}
            </span>
            <NuxtLink
              :to="megaMenuFeature.helperLinkTo"
              class="text-[11px] font-semibold text-primary-700 hover:underline"
            >
              {{ megaMenuFeature.helperLinkLabel }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
