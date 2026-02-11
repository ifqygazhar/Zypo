<script lang="ts">
	import { CHARACTERS, MAPS } from '$lib/gameConfig';
	import type { Snippet } from 'svelte';

	interface Props {
		playerName: string;
		selectedCharacter: string;
		selectedMap: string;
		isCreating: boolean;
		onCreate: () => void;
		onQuickMatch: () => void;
		joinSection: Snippet;
	}

	let {
		playerName = $bindable(),
		selectedCharacter = $bindable(),
		selectedMap = $bindable(),
		isCreating,
		onCreate,
		onQuickMatch,
		joinSection
	}: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
	<!-- LEFT COLUMN: Identity & Actions -->
	<div class="space-y-6 flex flex-col justify-center">
		<div>
			<label for="name" class="block text-xs font-bold uppercase text-neutral-500 mb-1"
				>Your Name</label
			>
			<input
				id="name"
				type="text"
				bind:value={playerName}
				placeholder="Enter nickname..."
				class="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-3 px-4 font-bold focus:outline-none focus:border-orange-500 transition-colors"
			/>
		</div>

		<!-- JOIN SECTION -->
		<div class="bg-neutral-900/50 p-4 rounded-xl border border-neutral-700/50">
			<div class="text-xs font-bold uppercase text-neutral-500 mb-2">Join Existing Game</div>
			{@render joinSection()}
		</div>

		<div class="relative py-2">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-neutral-700"></div>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-neutral-800 px-2 text-neutral-500">OR</span>
			</div>
		</div>

		<button
			onclick={onQuickMatch}
			disabled={isCreating}
			class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
		>
			<span>SEARCH OPPONENT</span>
			<span class="group-hover:translate-x-1 transition-transform">→</span>
		</button>

		<div class="relative py-2">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-neutral-700"></div>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-neutral-800 px-2 text-neutral-500">Custom Game</span>
			</div>
		</div>

		<button
			onclick={onCreate}
			disabled={isCreating}
			class="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20"
		>
			{isCreating ? 'CREATING...' : 'CREATE NEW GAME'}
		</button>
	</div>

	<!-- RIGHT COLUMN: Loadout -->
	<div class="space-y-6 bg-neutral-900/30 p-4 rounded-xl border border-neutral-800">
		<div class="space-y-2" role="group" aria-labelledby="char-selection-label">
			<div class="flex justify-between items-end">
				<div id="char-selection-label" class="block text-xs font-bold uppercase text-neutral-500">
					Select Partner
				</div>
				<div class="text-[10px] text-orange-500 font-mono">
					{CHARACTERS.find((c) => c.id === selectedCharacter)?.name.toUpperCase()} SYSTEM
				</div>
			</div>
			<div class="grid grid-cols-4 gap-2">
				{#each CHARACTERS as char}
					<button
						class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-neutral-900 {selectedCharacter ===
						char.id
							? 'border-orange-500 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
							: 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}"
						onclick={() => (selectedCharacter = char.id)}
						title={char.name}
					>
						<img
							src={`/character/${char.assets.face}`}
							alt={char.name}
							class="w-full h-full object-contain p-1"
						/>
						{#if selectedCharacter === char.id}
							<div class="absolute inset-0 bg-orange-500/10"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<div class="space-y-2" role="group" aria-labelledby="map-selection-label">
			<div id="map-selection-label" class="block text-xs font-bold uppercase text-neutral-500">
				Select Battleground
			</div>
			<div class="grid grid-cols-3 gap-2">
				{#each MAPS as map}
					<button
						class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all {selectedMap ===
						map
							? 'border-orange-500 scale-105'
							: 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}"
						onclick={() => (selectedMap = map)}
					>
						<img src={`/map/${map}`} alt={map} class="w-full h-full object-cover" />
						{#if selectedMap === map}
							<div class="absolute inset-0 bg-orange-500/20"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
