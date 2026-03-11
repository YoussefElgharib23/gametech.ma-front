import type { ComputedRef, Ref } from 'vue'
import type { UseFetchOptions } from 'nuxt/app'

export type ApiFetchUrl = string | (() => string) | Ref<string> | ComputedRef<string>

export function useAPIFetch<T>(url: ApiFetchUrl, options?: UseFetchOptions<T>) {
  const config = useRuntimeConfig()

  return useFetch(url as any, {
    ...options,
    baseURL: config.public.apiBaseUrl
  })
}
