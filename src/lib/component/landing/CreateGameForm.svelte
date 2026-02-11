<script lang="ts">
	import { CHARACTERS, MAPS } from '$lib/gameConfig';
	import type { Snippet } from 'svelte';

	interface Props {
		playerName: string;
		playerPin: string;
		selectedCharacter: string;
		selectedMap: string;
		isCreating: boolean;
		onCreate: () => void;
		onQuickMatch: () => void;
		joinSection: Snippet;
	}

	let {
		playerName = $bindable(),
		playerPin = $bindable(),
		selectedCharacter = $bindable(),
		selectedMap = $bindable(),
		isCreating,
		onCreate,
		onQuickMatch,
		joinSection
	}: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full h-full">
	<div class="flex flex-col gap-6 h-full justify-between">
		<div class="space-y-4">
			<div>
				<label for="name" class="block text-xs font-bold uppercase text-neutral-500 mb-2 ml-1"
					>Identity Access</label
				>
				<div class="flex gap-2">
					<input
						id="name"
						type="text"
						bind:value={playerName}
						placeholder="CODENAME"
						class="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl py-4 px-5 font-bold text-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-neutral-700 text-white"
					/>
					<input
						type="text"
						inputmode="numeric"
						maxlength="4"
						bind:value={playerPin}
						placeholder="PIN"
						class="w-24 bg-neutral-950 border border-neutral-800 rounded-xl py-4 px-5 font-bold text-lg text-center tracking-widest focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-neutral-700 text-white"
						oninput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''))}
					/>
				</div>
				<p class="text-[10px] text-neutral-600 mt-2 ml-1">
					* Set a 4-digit PIN to secure your rank.
				</p>
			</div>

			<div class="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800 border-dashed">
				<div class="text-[10px] font-bold uppercase text-neutral-500 mb-3 tracking-wider">
					Join via Code
				</div>
				{@render joinSection()}
			</div>
		</div>

		<div class="space-y-3 mt-auto pt-4">
			<button
				onclick={onQuickMatch}
				disabled={isCreating}
				class="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-all border border-neutral-700 hover:border-neutral-500 flex items-center justify-between px-6 group disabled:opacity-50"
			>
				<span class="text-sm uppercase tracking-wider text-neutral-400 group-hover:text-white"
					>Quick Match</span
				>
				<span class="text-xl group-hover:translate-x-1 transition-transform">⚡️</span>
			</button>

			<div class="relative flex items-center justify-center py-1">
				<span class="text-[10px] text-neutral-600 bg-transparent px-2 uppercase font-mono"
					>OR CREATE LOBBY</span
				>
			</div>

			<button
				onclick={onCreate}
				disabled={isCreating}
				class="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)] hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] active:scale-[0.98] disabled:opacity-50"
			>
				{isCreating ? 'INITIALIZING...' : 'CREATE NEW GAME'}
			</button>
		</div>
	</div>

	<div class="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800 flex flex-col gap-6">
		<div class="space-y-3">
			<div class="flex justify-between items-center">
				<span class="text-xs font-bold uppercase text-neutral-500">Operative</span>
				<span
					class="text-[10px] font-mono text-orange-500 border border-orange-500/30 px-1 rounded"
				>
					{CHARACTERS.find((c) => c.id === selectedCharacter)?.name}
				</span>
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

		<div class="space-y-3 mt-auto">
			<span class="text-xs font-bold uppercase text-neutral-500">Deployment Zone</span>
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
