// hooks/useSearchFilter.ts
import { useMemo } from "react";

export function useSearchFilter<T>(
  data: T[],
  query: string,
  keysToSearch: (keyof T)[],
  nestedArrayKey?: keyof T
) {
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter((item) => {
      if (q === "") return true;

      const match = keysToSearch.some((key) =>
        (item[key] as string).toLowerCase().includes(q)
      );

      if (!match && nestedArrayKey) {
        const nested = item[nestedArrayKey] as string[];
        return nested.some((entry) =>
          entry.toLowerCase().includes(q)
        );
      }

      return match;
    });
  }, [query, data, keysToSearch, nestedArrayKey]);

  return filtered;
}
