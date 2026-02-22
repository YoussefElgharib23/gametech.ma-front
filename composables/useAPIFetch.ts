import type { UseFetchOptions } from 'nuxt/app'

export function useAPIFetch<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>
) {
  const config = useRuntimeConfig()

  return useFetch(url, {
    ...options,
    baseURL: config.public.apiBaseUrl
  })
}
