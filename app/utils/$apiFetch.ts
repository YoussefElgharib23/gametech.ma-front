const httpErrorCodes = {
  unauthorized: 403,
  method_not_allowed: 405,
  validation_error: 422,
  too_many_attempts: 429,
  server_error: 500,
  not_found: 404,
};

export default function <T>(
  path: any,
  options: {
    method: string;
    body?: any;
    headers?: any;
    watch?: boolean;
    showToast?: boolean;
    withLoading?: boolean;
  } = {
    method: "GET",
    withLoading: true,
  },
) {
  const toast = useToast();
  const { startLoading, stopLoading } = useIsLoading();
  const { public: config } = useRuntimeConfig();
  const { $i18n } = useNuxtApp();
  const { t, locale } = $i18n;

  const token = useCookie("token");
  const visitor_token = useCookie<string | undefined>("visitor_token");
  const clientIp = useState("clientIp");

  const bearerToken = computed(() => {
    if (path.includes("/user")) {
      return token.value;
    }

    return token.value || visitor_token.value;
  });

  const computedHeaders = computed(() => {
    return {
      Language: locale.value,
      Authorization: `Bearer ${bearerToken.value}`,
      "X-Visitor-Token": visitor_token.value
        ? `Bearer ${visitor_token.value}`
        : undefined,
      "X-Requested-With": "XMLHttpRequest",
      "X-Client-IP": clientIp.value,
      "X-Forwarded-For": clientIp.value,
      ...useRequestHeaders(["cookie", "x-forwarded-for"]),
    };
  });

  let headers: Record<string, any> = {
    Authorization: `Bearer ${bearerToken.value}`,
    Language: locale.value,
    "X-Requested-With": "XMLHttpRequest",
    ...useRequestHeaders(["cookie", "x-forwarded-for"]),
  };

  options.showToast = options.showToast ?? true;

  options = {
    ...options,
    baseURL: config.apiBaseUrl as string,
    credentials: "include",
    headers: computedHeaders.value,
    onRequest() {
      if (options.withLoading) {
        startLoading();
      }
    },
    onRequestError() {
      if (options.withLoading) {
        stopLoading();
      }
    },
    onResponse({ response }: any) {
      stopLoading();

      if (!options.showToast) return;

      if (response.status == 401) return;

      const { message: description } = response._data;
      const { meta: meta_data } = response._data;

      if (description) {
        let title: "error" | "success" | null = null;
        let color: "error" | "success" | null = null;

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
    onResponseError() {
      stopLoading();
    },
  };

  return $fetch<T>(path, options as any);
}

