type Visitor = {
  id: number;
  language: string;
  in_europe: boolean;
  fingerprint: string;
  utm_source: string | null;
  utm_campaign: string | null;
};

function clientFingerprint() {
  if (!import.meta.client) return {};

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
  };
}

export default function useVisitor() {
  const visitor = useState<Visitor | undefined>("visitor");

  const authenticateVisitor = async () => {
    const visitor_token = useCookie<string | undefined>("visitor_token", {
      maxAge: 60 * 60 * 24 * 30 * 365,
    });

    const data = await $apiFetch<{
      token: string | null;
      user: Visitor;
      has_password: boolean;
    }>("/visit", {
      method: "POST",
      body: {
        fingerprint: clientFingerprint(),
      },
      showToast: false,
      withLoading: false,
    });

    if (data?.token) {
      visitor_token.value = data.token;
      refreshCookie("visitor_token");
    }

    if (data?.user) {
      visitor.value = data.user;
    }
  };

  return {
    visitor,
    authenticateVisitor,
  };
}
