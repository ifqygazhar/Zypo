<script lang="ts">
	import { browser } from '$app/environment';
	import { CHARACTERS } from '$lib/gameConfig';

	interface Props {
		game: any;
		playerId: string;
		onStartGame: () => void;
	}

	let { game, playerId, onStartGame }: Props = $props();
	let copied = $state(false);

	function copyCode() {
		if (browser) {
			navigator.clipboard.writeText(game.code);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}
</script>

<!-- LOBBY BACKGROUND -->
{#if game.mapId}
	<div class="absolute inset-0 z-0">
		<img
			src={`/map/${game.mapId}`}
			alt="Background"
			class="w-full h-full object-cover opacity-30 blur-sm scale-110"
		/>
		<div class="absolute inset-0 bg-black/60"></div>
	</div>
{/if}

<div class="relative z-10 w-full max-w-4xl mx-auto flex flex-col h-[90vh] justify-center">
	<!-- HEADER / CODE -->
	<div class="text-center mb-12">
		<button
			onclick={copyCode}
			class="group relative inline-flex flex-col items-center hover:scale-105 transition-transform"
		>
			<div class="text-sm font-bold text-neutral-400 mb-2 tracking-[0.2em] uppercase">
				Mission Access Code
			</div>
			<div
				class="text-7xl font-black bg-white text-black px-8 py-2 rounded-xl border-4 border-neutral-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-4"
			>
				{game.code}
				{#if copied}
					<span class="text-xs absolute -right-20 top-1/2 -translate-y-1/2 text-green-400 font-bold"
						>COPIED!</span
					>
				{:else}
					<span class="text-neutral-300 text-3xl group-hover:text-black transition-colors">📋</span>
				{/if}
			</div>
			<p class="text-xs text-neutral-500 mt-4 animate-pulse">SHARE THIS CODE TO INVITE OPPONENT</p>
		</button>
	</div>

	<!-- VS SECTION -->
	<div class="flex items-center justify-center gap-8 mb-12">
		<!-- PLAYER 1 (HOST/ME) -->
		{#each game.players as p}
			{@const char = CHARACTERS.find((c) => c.id === p.characterId)}
			<div class="relative w-64 h-80 perspective-1000 group">
				<div
					class="w-full h-full bg-neutral-900 border-2 {p.id === playerId
						? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
						: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'} rounded-xl overflow-hidden flex flex-col relative"
				>
					<!-- BG GLOW -->
					<div
						class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 {p.id ===
						playerId
							? 'bg-orange-500/20'
							: 'bg-blue-500/20'} blur-3xl rounded-full"
					></div>

					<!-- AVATAR -->
					<div class="flex-1 relative p-4 flex items-center justify-center">
						{#if char}
							<img
								src={`/character/${char.assets.front}`}
								alt={char.name}
								class="w-full h-full object-contain drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500"
							/>
						{/if}
					</div>

					<!-- INFO -->
					<div class="bg-black/80 backdrop-blur p-4 border-t border-white/10">
						<div class="font-black text-xl truncate uppercase">{p.name}</div>
						<div class="flex justify-between items-center mt-1">
							<span class="text-xs text-neutral-400 font-bold">LEVEL 50</span>
							<span
								class="px-2 py-0.5 rounded text-[10px] font-bold {p.id === playerId
									? 'bg-orange-500 text-black'
									: 'bg-blue-500 text-black'}">READY</span
							>
						</div>
					</div>
				</div>
				{#if p.id === playerId}
					<div
						class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 text-xs font-black rounded-full uppercase"
					>
						You
					</div>
				{/if}
			</div>
		{/each}

		<!-- VS BADGE (Only if 2 players) -->
		{#if game.players.length >= 2}
			<div class="text-6xl font-black text-red-600 italic animate-pulse px-4">VS</div>
		{:else}
			<!-- EMPTY SLOT -->
			<div
				class="w-64 h-80 relative rounded-xl border-2 border-dashed border-neutral-700 bg-black/20 flex flex-col items-center justify-center text-neutral-600 gap-4"
			>
				<div
					class="w-16 h-16 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-neutral-700 border-l-transparent animate-spin"
				></div>
				<div class="text-xs font-bold tracking-widest animate-pulse">SEARCHING FOR OPPONENT...</div>
			</div>
		{/if}
	</div>

	<!-- ACTION BUTTON -->
	<div class="max-w-md mx-auto w-full">
		{#if game.players.length >= 2}
			<button onclick={onStartGame} class="w-full relative group overflow-hidden rounded-lg">
				<div
					class="absolute inset-0 bg-orange-500 group-hover:bg-orange-400 transition-colors"
				></div>
				<div class="relative px-8 py-6 flex items-center justify-center gap-4">
					<span class="text-black font-black text-2xl tracking-widest uppercase"
						>Initiate Battle Sequence</span
					>
					<span class="text-black text-2xl group-hover:translate-x-2 transition-transform">→</span>
				</div>
			</button>
		{:else}
			<div class="text-center text-neutral-500 text-sm font-mono">
				Waiting for execution authorization [1/2]
			</div>
		{/if}
	</div>
</div>
