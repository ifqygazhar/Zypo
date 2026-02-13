<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-neutral-950 text-white p-4 md:p-8 flex flex-col items-center">
	<div
		class="fixed top-0 left-0 w-full h-96 bg-linear-to-b from-orange-900/10 to-transparent pointer-events-none"
	></div>

	<div class="w-full max-w-3xl z-10">
		<button
			onclick={() => goto('/')}
			class="mb-8 text-neutral-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
		>
			← Back to Lobby
		</button>

		<h1 class="text-4xl md:text-6xl font-black italic uppercase mb-12 text-orange-500">Credits</h1>

		<div class="space-y-12">
			<section>
				<h2 class="text-2xl font-bold mb-6 border-b border-neutral-800 pb-2">Game Assets</h2>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
						<h3 class="font-bold text-lg mb-2 text-white">Characters</h3>
						<p class="text-neutral-400 text-sm">
							Monster sprites from <strong class="text-orange-400">Tuxemon</strong>
						</p>
					</div>
					<div class="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
						<h3 class="font-bold text-lg mb-2 text-white">Maps</h3>
						<p class="text-neutral-400 text-sm">
							Map assets from <strong class="text-orange-400">Craftpix</strong>
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-bold mb-6 border-b border-neutral-800 pb-2">Soundtrack</h2>
				<div class="space-y-4">
					<div class="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
						<h3 class="font-bold text-lg mb-1 text-white">Background Music</h3>
						<ul class="list-disc pl-5 text-neutral-400 text-sm space-y-2">
							<li>
								<span class="text-neutral-300">Lobby:</span>
								<a
									href="https://www.youtube.com/watch?v=F1TSjJaxMBo"
									target="_blank"
									class="text-orange-400 hover:text-orange-300 transition-colors"
									>Pokemon Red & Blue Jazz</a
								>
							</li>
							<li>
								<span class="text-neutral-300">Battle 1:</span>
								<a
									href="https://youtu.be/cisslWkofMQ"
									target="_blank"
									class="text-orange-400 hover:text-orange-300 transition-colors"
									>Jojo 8bit Version</a
								>
							</li>
							<li>
								<span class="text-neutral-300">Battle 2:</span>
								<a
									href="https://youtu.be/EHoKD1EwXgo"
									target="_blank"
									class="text-orange-400 hover:text-orange-300 transition-colors"
									>Persona 5 Royal 8bit Version</a
								>
							</li>
							<li>
								<span class="text-neutral-300">Battle 3:</span>
								<a
									href="https://youtu.be/a8WVKRfWmw4"
									target="_blank"
									class="text-orange-400 hover:text-orange-300 transition-colors"
									>Persona 5 Royal 8bit Version life will change</a
								>
							</li>
						</ul>
					</div>

					<div class="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
						<h3 class="font-bold text-lg mb-1 text-white">SFX</h3>
						<p class="text-neutral-400 text-sm">
							Soundtrack hits from <strong class="text-orange-400">Public Asset Memes</strong>
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-bold mb-6 border-b border-neutral-800 pb-2">Tech Stack</h2>
				<div class="flex flex-wrap gap-2">
					{#each ['SvelteKit', 'Convex', 'TailwindCSS', 'TypeScript'] as tech}
						<span
							class="px-3 py-1 bg-neutral-800 rounded-full text-xs font-mono text-neutral-300 border border-neutral-700"
						>
							{tech}
						</span>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-bold mb-6 border-b border-neutral-800 pb-2">Connect</h2>
				<div class="flex gap-4">
					<a
						href="https://github.com/ifqygazhar"
						target="_blank"
						class="text-neutral-400 hover:text-white transition-colors p-2 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-600"
						title="GitHub"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-github"
						>
							<path
								d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
							/>
							<path d="M9 18c-4.51 2-5-2-7-2" />
						</svg>
					</a>
					<a
						href="https://linkedin.com/in/ifqygazhar"
						target="_blank"
						class="text-neutral-400 hover:text-white transition-colors p-2 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-600"
						title="LinkedIn"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-linkedin"
						>
							<path
								d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
							/>
							<rect width="4" height="12" x="2" y="9" />
							<circle cx="4" cy="4" r="2" />
						</svg>
					</a>
					<a
						href="https://ifqy.dev/#cv"
						target="_blank"
						class="text-neutral-400 hover:text-white transition-colors p-2 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-600"
						title="Website"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-globe"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
							<path d="M2 12h20" />
						</svg>
					</a>
				</div>
			</section>

			<div class="text-center pt-12 pb-8 text-neutral-600 text-xs font-mono">
				<p>ZYPO <i>@ifqygazhar</i> &copy; {new Date().getFullYear()} - THINK FAST. STRIKE HARD.</p>
			</div>
		</div>
	</div>
</div>
