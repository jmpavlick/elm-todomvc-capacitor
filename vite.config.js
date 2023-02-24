import { defineConfig } from "vite";
import elmPlugin from "vite-plugin-elm";

const flags =
    (function() {
        if (process.env.NODE_ENV === 'DEV') {
            return { debug: true, optimize: false };
        } else {
            return { debug: false, optimize: true };
        }
    })();

export default defineConfig({
    plugins: [elmPlugin(flags)],
    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
    server: {
        port: 3000
    }
    });