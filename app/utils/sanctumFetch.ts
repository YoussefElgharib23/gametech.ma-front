type SanctumFetchOptions = Parameters<typeof $fetch>[1];

export async function fetchCsrfCookie(): Promise<void> {
  const { public: config } = useRuntimeConfig();
  const appBaseUrl = (config.apiBaseUrl as string).replace(/\/api\/?$/, "");

  await $fetch("/sanctum/csrf-cookie", {
    baseURL: appBaseUrl,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });
}

export async function sanctumFetch<T>(
  path: string,
  options: SanctumFetchOptions = {},
): Promise<T> {
  const { public: config } = useRuntimeConfig();

  const method = (options.method ?? "GET").toUpperCase();
  const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (needsCsrf) {
    await fetchCsrfCookie();
  }

  return $fetch<T>(path, {
    baseURL: config.apiBaseUrl as string,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(options.headers as Record<string, string> | undefined),
    },
    ...options,
  });
}
