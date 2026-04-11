const httpErrorCodes = {
  unauthorized: 403,
  method_not_allowed: 405,
  validation_error: 422,
  too_many_attempts: 429,
  server_error: 500,
  not_found: 404,
};

export default function <T>(
  path: string | (() => string) | import("vue").Ref<string> | import("vue").ComputedRef<string>,
  options: any = {},
  auth_token: string | null = null,
) {
  const { public: config } = useRuntimeConfig();
  const { startLoading, stopLoading } = useIsLoading();
  const toast = useToast();

  const pathRef = computed(() =>
    typeof path === "function" ? (path as () => string)() : typeof path === "object" && path && "value" in path ? (path as import("vue").Ref<string>).value : path,
  );

  let locale = ref<string | undefined>();
  let t: ((key: string, params?: any) => string) | null = null;

  if (useNuxtApp().$i18n) {
    const { $i18n } = useNuxtApp();
    locale.value = $i18n.locale.value;
    t = $i18n.t;
  }

  const token = useCookie<string | null>("token");
  const visitor_token = useCookie<string | undefined>("visitor_token");
  const clientIp = useState("clientIp");

  let headers: Record<string, any> = {
    Authorization: `Bearer ${auth_token || token.value}`,
    Language: locale.value,
    "X-Requested-With": "XMLHttpRequest",
    "X-Visitor-Token": visitor_token.value
      ? `Bearer ${visitor_token.value}`
      : undefined,
    "X-Client-IP": clientIp.value,
    "X-Forwarded-For": clientIp.value,
    ...useRequestHeaders(["cookie", "x-forwarded-for"]),
  };

  const bearerToken = computed(() => {
    const p = pathRef.value;
    if (typeof p === "string" && p.includes("/user")) {
      return auth_token || token.value;
    }
    return auth_token || token.value || visitor_token.value;
  });

  const computedHeaders = computed(() => {
    return {
      Language: locale.value,
      Authorization: `Bearer ${bearerToken.value}`,
      "X-Requested-With": "XMLHttpRequest",
      "X-Visitor-Token": visitor_token.value
        ? `Bearer ${visitor_token.value}`
        : undefined,
      "X-Client-IP": clientIp.value,
      "X-Forwarded-For": clientIp.value,
      ...useRequestHeaders(["cookie", "x-forwarded-for"]),
    };
  });

  options = {
    ...options,
    baseURL: config.apiBaseUrl,
    headers: computedHeaders,
    async onRequest() {
      await startLoading();
    },
    async onRequestError(error: any) {
      await stopLoading();
    },
    async onResponse({ response }: { response: any }) {
      await stopLoading();

      if (response.status == 401) return;

      const { message: description } = response._data;
      const { meta: meta_data } = response._data;

      if (description) {
        let title: string | null = null;
        let color: string | null = null;

        if (Object.values(httpErrorCodes).includes(response.status)) {
          title = color = "error";
        } else {
          title = color = "success";
        }

        toast.add({
          title: !t ? title : t(title),
          description: !t
            ? description
            : meta_data
              ? t(description, { meta: meta_data })
              : t(description),
          color: color as any,
        });
      }
    },
    async onResponseError() {
      await stopLoading();
    },
  };

  return useFetch<T>(pathRef, {
    ...options,
  });
}

