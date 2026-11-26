import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

// Only the admin panel's theme is built here (docs/design.md, "Painel"); the web app has its own build (apps/web).
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/filament/admin/theme.css'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
