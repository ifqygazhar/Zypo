import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit(), tailwindcss()],
	esbuild: {
		pure:
			mode === 'production' ? ['console.log', 'console.info', 'console.debug', 'console.trace'] : []
	}
}));
