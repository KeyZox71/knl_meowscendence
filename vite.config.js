import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [
		tailwindcss()
	],
	root: resolve(__dirname, 'src/front'),
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'src/front/index.html'),
			},
		},
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
	}
})
