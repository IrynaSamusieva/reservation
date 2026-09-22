/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE: string;
    // Добавляй сюда любые свои VITE_ переменные
    readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
