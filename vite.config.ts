import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
            command: "php artisan wayfinder:generate --with-form"
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: true,
        port: 3009,
        hmr: {host: 'localhost', protocol: 'ws'},
    },
});
