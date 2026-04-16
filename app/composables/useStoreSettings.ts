type PublicStoreSettingsResponse = {
  settings: Record<string, unknown>;
};

export type StoreSettings = {
  company_email?: string;
  company_phone_1?: string;
  company_phone_2?: string;
  flash_sales_enabled?: boolean;
  flash_sales_expires_at?: string;
  socials_whatsapp?: string;
};

export function useStoreSettings() {
  const storeSettings = useState<StoreSettings>("storeSettings", () => ({}));

  async function load() {
    const { data } = await useAPIFetch<PublicStoreSettingsResponse>("/store-settings/public", {
      server: true,
      lazy: false,
    });

    const s = data.value?.settings ?? {};
    const flashEnabledRaw = s["flash_sales.enabled"];
    const flashEnabled =
      typeof flashEnabledRaw === "boolean" ? flashEnabledRaw : flashEnabledRaw === 1 || flashEnabledRaw === "1";
    storeSettings.value = {
      company_email: typeof s["company.email"] === "string" ? (s["company.email"] as string) : undefined,
      company_phone_1: typeof s["company.phone_1"] === "string" ? (s["company.phone_1"] as string) : undefined,
      company_phone_2: typeof s["company.phone_2"] === "string" ? (s["company.phone_2"] as string) : undefined,
      flash_sales_enabled: flashEnabled,
      flash_sales_expires_at:
        typeof s["flash_sales.expires_at"] === "string" ? (s["flash_sales.expires_at"] as string) : undefined,
      socials_whatsapp: typeof s["socials.whatsapp"] === "string" ? (s["socials.whatsapp"] as string) : undefined,
    };
  }

  return {
    storeSettings,
    load,
  };
}
