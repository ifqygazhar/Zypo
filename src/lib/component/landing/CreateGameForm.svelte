<script lang="ts">
	import { CHARACTERS, MAPS } from '$lib/gameConfig';
	import type { Snippet } from 'svelte';
	import { convex } from '$lib/convex.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import { processAndUploadImage } from '$lib/utils/upload';

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

	const communityAssets = useQuery(api.files.getPublicAssets, {});

	let customAvatar = $state<string | null>(null);
	let fileInput: HTMLInputElement;
	let isUploading = $state(false);

	function triggerUpload() {
		if (!playerName.trim()) {
			alert('Please enter your Codename first!');
			return;
		}
		fileInput.click();
	}

	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		isUploading = true;

		try {
			const result = await processAndUploadImage(file, convex, playerName);
			selectedCharacter = result.storageId;
			customAvatar = result.previewUrl;
			console.log('Upload sukses:', result.storageId);
		} catch (err) {
			console.error('Upload error:', err);
			alert('Failed to upload image.');
			customAvatar = null;
			selectedCharacter = '';
		} finally {
			isUploading = false;
			target.value = '';
		}
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-full">
	<input
		type="file"
		accept="image/*"
		class="hidden"
		bind:this={fileInput}
		onchange={handleFileUpload}
	/>

	<div class="lg:col-span-5 flex flex-col gap-6 h-full">
		<div class="space-y-5 bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800 shadow-lg">
			<div>
				<label
					for="name"
					class="flex items-center gap-2 text-xs font-bold uppercase text-orange-500 mb-2 ml-1 tracking-wider"
				>
					<span class="bg-orange-500/10 p-1 rounded">ID</span> Identity Access
				</label>

				<div class="flex flex-col sm:flex-row gap-3">
					<div class="relative flex-1 group">
						<input
							id="name"
							type="text"
							bind:value={playerName}
							placeholder="CODENAME"
							autocomplete="off"
							class="w-full bg-black/40 border border-neutral-700 group-hover:border-neutral-500 focus:border-orange-500 rounded-xl py-3 px-4 font-bold text-lg text-white placeholder:text-neutral-700 outline-none transition-all shadow-inner"
						/>
					</div>

					<div class="relative w-full sm:w-28 group">
						<input
							type="text"
							inputmode="numeric"
							maxlength="4"
							bind:value={playerPin}
							placeholder="PIN"
							autocomplete="off"
							class="w-full bg-black/40 border border-neutral-700 group-hover:border-neutral-500 focus:border-orange-500 rounded-xl py-3 px-4 font-mono font-bold text-lg text-center tracking-[0.2em] text-orange-400 placeholder:text-neutral-700 outline-none transition-all shadow-inner"
							oninput={(e) =>
								(e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''))}
						/>
					</div>
				</div>
				<p class="text-[10px] text-neutral-500 mt-2 ml-1 flex items-center gap-1">
					<span class="text-orange-500">*</span> Secure your rank with a 4-digit PIN.
				</p>
			</div>

			<div class="pt-2 border-t border-neutral-800">
				<div class="text-[10px] font-bold uppercase text-neutral-500 mb-3 tracking-wider ml-1">
					Join Existing Lobby
				</div>
				{@render joinSection()}
			</div>
		</div>

		<div class="space-y-3 mt-auto">
			<button
				onclick={onQuickMatch}
				disabled={isCreating || isUploading}
				class="relative w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-all border border-neutral-700 hover:border-neutral-500 flex items-center justify-between px-6 group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
			>
				<div
					class="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
				></div>
				<span
					class="text-sm uppercase tracking-wider text-neutral-400 group-hover:text-white relative z-10"
					>{isUploading ? 'UPLOADING...' : 'Quick Match'}</span
				>
				<span class="text-xl group-hover:scale-125 transition-transform relative z-10">⚡️</span>
			</button>

			<div class="relative flex items-center justify-center py-1">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-neutral-800"></div>
				</div>
				<span class="relative bg-neutral-900 px-2 text-[10px] text-neutral-600 uppercase font-mono"
					>OR</span
				>
			</div>

			<button
				onclick={onCreate}
				disabled={isCreating || isUploading}
				class="w-full bg-linear-to-r from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(234,88,12,0.2)] hover:shadow-[0_4px_30px_rgba(234,88,12,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide border-t border-white/10"
			>
				{#if isUploading}
					<span class="animate-pulse">Uploading Image...</span>
				{:else if isCreating}
					<span class="animate-pulse">Initializing...</span>
				{:else}
					Create New Game
				{/if}
			</button>
		</div>
	</div>

	<div
		class="lg:col-span-7 bg-neutral-900/50 p-1 rounded-2xl border border-neutral-800 flex flex-col h-125 lg:h-full relative overflow-hidden"
	>
		<div
			class="absolute top-0 left-0 w-full p-4 bg-neutral-900/90 backdrop-blur z-10 border-b border-neutral-800 flex justify-between items-center"
		>
			<span class="text-xs font-bold uppercase text-neutral-400 flex items-center gap-2">
				<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Loadout Selection
			</span>
			<span
				class="text-[10px] font-mono text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded bg-orange-500/10 truncate max-w-30"
			>
				{customAvatar || !CHARACTERS.find((c) => c.id === selectedCharacter)
					? 'CUSTOM'
					: CHARACTERS.find((c) => c.id === selectedCharacter)?.name || 'UNKNOWN'}
			</span>
		</div>

		<div class="flex-1 overflow-y-auto p-4 pt-16 custom-scrollbar space-y-8">
			<div class="space-y-3">
				<div class="text-[10px] font-bold uppercase text-neutral-600 tracking-widest">
					Select Operative
				</div>

				<div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
					<button
						class="relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-black/40 flex flex-col items-center justify-center group
						{customAvatar && selectedCharacter && !CHARACTERS.find((c) => c.id === selectedCharacter)
							? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
							: 'border-dashed border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800'}"
						onclick={triggerUpload}
						disabled={isUploading}
						title="Upload Custom Image"
					>
						{#if isUploading}
							<div
								class="w-6 h-6 border-2 border-neutral-500 border-t-orange-500 rounded-full animate-spin"
							></div>
						{:else if customAvatar}
							<img src={customAvatar} alt="Custom" class="w-full h-full object-cover" />
							<div
								class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<span class="text-xs font-bold text-white">CHANGE</span>
							</div>
						{:else}
							<span class="text-2xl mb-1 text-neutral-500 group-hover:text-white transition-colors"
								>+</span
							>
							<span
								class="text-[8px] uppercase font-bold text-neutral-600 group-hover:text-neutral-400"
								>Upload</span
							>
						{/if}
					</button>

					{#each CHARACTERS as char}
						<button
							class="relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-black/40 {selectedCharacter ===
							char.id
								? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-105 z-10'
								: 'border-transparent opacity-60 hover:opacity-100 hover:scale-105 hover:border-neutral-600'}"
							onclick={() => {
								selectedCharacter = char.id;
								customAvatar = null;
							}}
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

			<div class="space-y-3">
				<div class="flex justify-between items-end">
					<span class="text-[10px] font-bold uppercase text-neutral-600 tracking-widest"
						>Community Agents</span
					>
					{#if communityAssets.isLoading}
						<span class="text-[9px] text-neutral-500 animate-pulse">SYNCING...</span>
					{/if}
				</div>

				<div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
					{#if communityAssets.data}
						{#each communityAssets.data as asset}
							<button
								class="relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-black/40 group
                                {selectedCharacter === asset.storageId
									? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-105 z-10'
									: 'border-transparent opacity-50 hover:opacity-100 hover:scale-105 hover:border-neutral-600'}"
								onclick={() => {
									selectedCharacter = asset.storageId;
									customAvatar = asset.url;
								}}
							>
								<img
									src={asset.url}
									alt={asset.uploaderName}
									class="w-full h-full object-cover"
									loading="lazy"
								/>
								<div
									class="absolute bottom-0 left-0 w-full bg-black/80 text-[6px] text-neutral-300 text-center py-1 truncate px-1"
								>
									{asset.uploaderName}
								</div>

								{#if selectedCharacter === asset.storageId}
									<div class="absolute inset-0 bg-orange-500/10"></div>
									<div
										class="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center text-[8px] text-black font-bold"
									>
										✓
									</div>
								{/if}
							</button>
						{/each}
					{:else if communityAssets.isLoading}
						{#each Array(5) as _}
							<div class="aspect-square bg-neutral-800/50 rounded-xl animate-pulse"></div>
						{/each}
					{/if}
				</div>
				{#if communityAssets.data && communityAssets.data.length === 0}
					<div class="p-4 rounded-xl border border-dashed border-neutral-800 text-center">
						<div class="text-neutral-600 text-xs italic">
							No comms detected. Be the first to upload.
						</div>
					</div>
				{/if}
			</div>

			<div class="space-y-3 pb-6">
				<span class="text-[10px] font-bold uppercase text-neutral-600 tracking-widest"
					>Deployment Zone</span
				>
				<div class="grid grid-cols-3 gap-3">
					{#each MAPS as map}
						<button
							class="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border-2 transition-all {selectedMap ===
							map
								? 'border-orange-500 scale-105 shadow-lg z-10'
								: 'border-transparent opacity-50 hover:opacity-100 hover:scale-105 hover:border-neutral-600'}"
							onclick={() => (selectedMap = map)}
						>
							<img src={`/map/${map}`} alt={map} class="w-full h-full object-cover" />
							{#if selectedMap === map}
								<div class="absolute inset-0 bg-orange-500/10"></div>
								<div
									class="absolute bottom-2 right-2 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_orange]"
								></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Thin & Cyberpunk Scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #444;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #f97316; /* Orange hover */
	}
</style>
