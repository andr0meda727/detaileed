/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
  readonly VITE_API_URL?: string;
  /** MapLibre style URL; empty = OpenFreeMap (the ui package default). */
  readonly VITE_MAP_STYLE_URL?: string;
  /** Origin of the customer site, for links to a studio's public page; empty = https://detaileed.com. */
  readonly VITE_WEB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
