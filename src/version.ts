// Build-time version stamp. See vite.config.ts.
// Use this on a /version page or a dev-only footer so we always know which
// commit is deployed (per the user's "Preview Version Alignment" rule).
declare const __WD_COMMIT__: string;
declare const __WD_BRANCH__: string;
declare const __WD_BUILT_AT__: string;

export const VERSION = {
  commit: __WD_COMMIT__,
  branch: __WD_BRANCH__,
  builtAt: __WD_BUILT_AT__,
};
