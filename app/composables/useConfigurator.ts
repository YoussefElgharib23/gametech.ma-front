import { CONFIGURATOR_CATEGORIES, type ConfiguratorCategory } from "~/constants/configuratorCategories";

export interface ConfiguratorProduct {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  brand_name: string | null;
  brand_image: string | null;
  stockStatus: string;
  currentPrice: string;
  price: number;
  oldPrice: string | null;
  configurator_category: string | null;
}

export interface ConfiguratorSlot {
  category: ConfiguratorCategory;
  products: ConfiguratorProduct[];
}

const CATEGORY_ICONS: Record<string, string> = {
  PROCESSEUR: "i-lucide-cpu",
  "CPU COOLER": "i-lucide-wind",
  "CARTE MÈRE": "i-lucide-circuit-board",
  "Mémoires RAM": "i-lucide-memory-stick",
  "CARTE GRAPHIQUE": "i-lucide-monitor",
  SSD: "i-lucide-hard-drive",
  HDD: "i-lucide-database",
  "BOITIER GAMER": "i-lucide-box",
  "ALIMENTATION PC (PSU)": "i-lucide-plug-zap",
  SOURIS: "i-lucide-mouse",
  CLAVIER: "i-lucide-keyboard",
  CASQUE: "i-lucide-headphones",
  Microphone: "i-lucide-mic",
  COMBO: "i-lucide-combine",
  "ECRAN PC": "i-lucide-tv",
  "ENCEINTES PC": "i-lucide-speaker",
  WEBCAMS: "i-lucide-camera",
  "TAPIS SOURIS": "i-lucide-square-dashed-mouse-pointer",
};

const CATEGORY_GROUPS = [
  {
    label: "Composants",
    categories: [
      "PROCESSEUR",
      "CPU COOLER",
      "CARTE MÈRE",
      "Mémoires RAM",
      "CARTE GRAPHIQUE",
      "SSD",
      "HDD",
      "BOITIER GAMER",
      "ALIMENTATION PC (PSU)",
    ] as ConfiguratorCategory[],
  },
  {
    label: "Périphériques",
    categories: [
      "SOURIS",
      "CLAVIER",
      "CASQUE",
      "Microphone",
      "COMBO",
      "ECRAN PC",
      "ENCEINTES PC",
      "WEBCAMS",
      "TAPIS SOURIS",
    ] as ConfiguratorCategory[],
  },
];

export default function useConfigurator() {
  const slots = useState<ConfiguratorSlot[]>("configurator_slots", () =>
    CONFIGURATOR_CATEGORIES.map((cat) => ({
      category: cat,
      products: [],
    })),
  );

  function iconFor(category: ConfiguratorCategory): string {
    return CATEGORY_ICONS[category] ?? "i-lucide-component";
  }

  function slotFor(category: ConfiguratorCategory): ConfiguratorSlot {
    return slots.value.find((s) => s.category === category)!;
  }

  function addProduct(category: ConfiguratorCategory, product: ConfiguratorProduct): void {
    const slot = slotFor(category);
    if (slot.products.some((p) => p.id === product.id)) return;
    slot.products.push(product);
  }

  function removeProduct(category: ConfiguratorCategory, productId: number): void {
    const slot = slotFor(category);
    slot.products = slot.products.filter((p) => p.id !== productId);
  }

  function clearCategory(category: ConfiguratorCategory): void {
    slotFor(category).products = [];
  }

  function clearAll(): void {
    slots.value.forEach((s) => (s.products = []));
  }

  const totalPrice = computed(() =>
    slots.value.reduce((sum, slot) => sum + slot.products.reduce((s, p) => s + p.price, 0), 0),
  );

  const totalProducts = computed(() => slots.value.reduce((n, slot) => n + slot.products.length, 0));

  const filledCategories = computed(() => slots.value.filter((s) => s.products.length > 0).length);

  const allSelectedProducts = computed(() => slots.value.flatMap((s) => s.products));

  function formatPrice(value: number): string {
    return value.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DH";
  }

  return {
    slots,
    groups: CATEGORY_GROUPS,
    iconFor,
    slotFor,
    addProduct,
    removeProduct,
    clearCategory,
    clearAll,
    totalPrice,
    totalProducts,
    filledCategories,
    allSelectedProducts,
    formatPrice,
  };
}
