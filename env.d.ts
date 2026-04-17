declare module "@vueuse/integrations/useSortable" {
  export type UseSortableOptions = {
    animation?: number;
    handle?: string;
  };

  export function useSortable<T>(
    selector: string | HTMLElement,
    list: { value: T[] },
    options?: UseSortableOptions,
  ): { destroy?: () => void } | undefined;
}

