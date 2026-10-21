import { useTheme } from "@devopsplaybook.io/common-web/composables/useTheme.ts";

type ThemeApi = ReturnType<typeof useTheme>;

let sharedTheme: ThemeApi | null = null;

/** One theme state for the header toggle and the profile preference buttons. */
export function useAppTheme(): ThemeApi {
  if (!sharedTheme) {
    sharedTheme = useTheme();
  }
  return sharedTheme;
}
