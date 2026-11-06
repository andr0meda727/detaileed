/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
  readonly VITE_API_URL?: string;
  // Możesz tu w przyszłości dopisywać kolejne zmienne z .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}