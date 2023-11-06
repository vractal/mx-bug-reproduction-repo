import react from '@vitejs/plugin-react-swc';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const isDevelopment = process.env.NODE_ENV !== 'production';

/** @type {import('vite').UserConfig} */
export default defineConfig({
	plugins: [
		svgr(),
		ViteImageOptimizer({
			/* pass your config */
		}),
		react(),
		nodePolyfills({
			// Whether to polyfill specific globals.
			globals: {
				Buffer: true, // can also be 'build', 'dev', or false
				global: true,
				process: true
			},
			// Whether to polyfill `node:` protocol imports.
			protocolImports: true
		})
	],
	resolve: {
		alias: {
			components: path.resolve('./src/components'),
			lib: path.resolve('./src/lib'),
			pages: path.resolve('./src/pages'),
			api: path.resolve('./src/api'),
			assets: path.resolve('./src/assets'),
			declarations: path.resolve('./src/declarations'),

			// Web3Auth config
			crypto: 'empty-module',
			assert: 'empty-module',
			http: 'empty-module',
			https: 'empty-module',
			os: 'empty-module',
			url: 'empty-module',
			zlib: 'empty-module',
			stream: 'empty-module',
			_stream_duplex: 'empty-module',
			_stream_passthrough: 'empty-module',
			_stream_readable: 'empty-module',
			_stream_writable: 'empty-module',
			_stream_transform: 'empty-module'
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			}
		}
	},
	define: {
		'process.env.NODE_ENV': isDevelopment,
		global: 'globalThis'
	},
	server: {
		port: 3000
	},
	build: {
		minify: 'esbuild'
	}
});
