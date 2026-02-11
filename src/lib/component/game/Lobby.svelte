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

{#snippet RenderAvatar(characterId: string)}
	{#if characterId && (characterId.startsWith('data:image') || characterId.startsWith('http'))}
		<img
			src={characterId}
			alt="Custom Agent"
			class="w-full h-full object-cover rounded-lg shadow-inner"
		/>
	{:else}
		{@const char = CHARACTERS.find((c) => c.id === characterId)}
		{#if char}
			<img
				src={`/character/${char.assets.front}`}
				alt={char.name}
				class="w-full h-full object-contain drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500"
			/>
		{/if}
	{/if}
{/snippet}

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

<div
	class="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 h-[90vh] items-center p-4 content-center"
>
	<div class="flex flex-col items-center md:items-start space-y-12 order-2 md:order-1">
		<div class="text-center md:text-left">
			<button
				onclick={copyCode}
				class="group relative inline-flex flex-col items-center md:items-start hover:scale-105 transition-transform"
			>
				<div class="text-xs md:text-sm font-bold text-neutral-400 mb-2 tracking-[0.2em] uppercase">
					Mission Access Code
				</div>
				<div
					class="text-5xl md:text-8xl font-black bg-white text-black px-6 md:px-10 py-2 md:py-4 rounded-xl border-4 border-neutral-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-4"
				>
					{game.code}
					{#if copied}
						<span
							class="text-xs absolute -right-20 top-1/2 -translate-y-1/2 text-green-400 font-bold hidden md:block"
							>COPIED!</span
						>
					{:else}
						<span
							class="text-neutral-300 text-2xl md:text-4xl group-hover:text-black transition-colors"
							>📋</span
						>
					{/if}
				</div>
				<p class="text-[10px] md:text-xs text-neutral-500 mt-4 animate-pulse uppercase">
					Tap to copy & invite opponent
				</p>
			</button>
		</div>

		<div class="w-full max-w-md">
			{#if game.players.length >= 2}
				<button onclick={onStartGame} class="w-full relative group overflow-hidden rounded-lg">
					<div
						class="absolute inset-0 bg-orange-500 group-hover:bg-orange-400 transition-colors"
					></div>
					<div class="relative px-8 py-6 flex items-center justify-center gap-4">
						<span
							class="text-black font-black text-xl md:text-2xl tracking-widest uppercase text-nowrap"
							>Start Battle</span
						>
						<span class="text-black text-2xl group-hover:translate-x-2 transition-transform">→</span
						>
					</div>
				</button>
			{:else}
				<div
					class="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-4 text-center text-neutral-500 text-sm font-mono"
				>
					<span class="animate-pulse">Waiting for opponent to join...</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex items-center justify-center gap-4 md:gap-8 order-1 md:order-2">
		{#each game.players as p, i}
			<div class="relative w-36 md:w-64 h-56 md:h-80 perspective-1000 group">
				<div
					class="w-full h-full bg-neutral-900 border-2 {p.id === playerId
						? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
						: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'} rounded-xl overflow-hidden flex flex-col relative"
				>
					<div
						class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 md:w-40 h-24 md:h-40 {p.id ===
						playerId
							? 'bg-orange-500/20'
							: 'bg-blue-500/20'} blur-3xl rounded-full"
					></div>

					<div class="flex-1 relative p-2 md:p-4 flex items-center justify-center">
						{@render RenderAvatar(p.characterId)}
					</div>

					<div class="bg-black/80 backdrop-blur p-2 md:p-4 border-t border-white/10">
						<div class="font-black text-sm md:text-xl truncate uppercase">{p.name}</div>
						<div class="flex justify-between items-center mt-1">
							<span class="text-[10px] md:text-xs text-neutral-400 font-bold">LVL 50</span>
							<span
								class="px-2 py-0.5 rounded text-[8px] md:text-[10px] font-bold {p.id === playerId
									? 'bg-orange-500 text-black'
									: 'bg-blue-500 text-black'}">READY</span
							>
						</div>
					</div>
				</div>
				{#if p.id === playerId}
					<div
						class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-black rounded-full uppercase"
					>
						You
					</div>
				{/if}
			</div>

			{#if i === 0 && game.players.length >= 2}
				<div
					class="text-3xl md:text-6xl font-black text-red-600 italic animate-pulse -mx-2 md:px-4 z-10"
				>
					VS
				</div>
			{/if}
		{/each}

		{#if game.players.length < 2}
			<div
				class="w-36 md:w-64 h-56 md:h-80 relative rounded-xl border-2 border-dashed border-neutral-700 bg-black/20 flex flex-col items-center justify-center text-neutral-600 gap-4"
			>
				<div
					class="w-8 md:w-16 h-8 md:h-16 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-neutral-700 border-l-transparent animate-spin"
				></div>
				<div
					class="text-[10px] md:text-xs font-bold tracking-widest animate-pulse text-center px-4"
				>
					SCANNING...
				</div>
			</div>
		{/if}
	</div>
</div>
