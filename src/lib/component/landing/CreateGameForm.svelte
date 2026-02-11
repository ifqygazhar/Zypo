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
			alert('Isi nama dulu sebelum upload!');
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
			alert('Gagal mengupload gambar.');
			customAvatar = null;
			selectedCharacter = '';
		} finally {
			isUploading = false;
			target.value = '';
		}
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full h-full">
	<input
		type="file"
		accept="image/*"
		class="hidden"
		bind:this={fileInput}
		onchange={handleFileUpload}
	/>

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
				disabled={isCreating || isUploading}
				class="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-all border border-neutral-700 hover:border-neutral-500 flex items-center justify-between px-6 group disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span class="text-sm uppercase tracking-wider text-neutral-400 group-hover:text-white"
					>{isUploading ? 'UPLOADING...' : 'Quick Match'}</span
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
				disabled={isCreating || isUploading}
				class="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)] hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isUploading}
					UPLOADING IMAGE...
				{:else if isCreating}
					INITIALIZING...
				{:else}
					CREATE NEW GAME
				{/if}
			</button>
		</div>
	</div>

	<div
		class="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800 flex flex-col gap-6 h-full overflow-hidden"
	>
		<div class="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-xs font-bold uppercase text-neutral-500">Operative</span>
					<span
						class="text-[10px] font-mono text-orange-500 border border-orange-500/30 px-1 rounded truncate max-w-[100px]"
					>
						{customAvatar || !CHARACTERS.find((c) => c.id === selectedCharacter)
							? 'CUSTOM / COMMUNITY'
							: CHARACTERS.find((c) => c.id === selectedCharacter)?.name || 'UNKNOWN'}
					</span>
				</div>

				<div class="grid grid-cols-4 gap-2">
					<button
						class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-neutral-900 flex flex-col items-center justify-center group
                        {customAvatar &&
						selectedCharacter &&
						!CHARACTERS.find((c) => c.id === selectedCharacter)
							? 'border-orange-500 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
							: 'border-dashed border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800'}"
						onclick={triggerUpload}
						disabled={isUploading}
						title="Upload New"
					>
						{#if isUploading}
							<div
								class="w-6 h-6 border-2 border-neutral-500 border-t-orange-500 rounded-full animate-spin"
							></div>
						{:else if customAvatar}
							<img src={customAvatar} alt="Custom" class="w-full h-full object-cover" />
							<div
								class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<span class="text-xs">✏️</span>
							</div>
						{:else}
							<span class="text-xl mb-1 text-neutral-500 group-hover:text-white">+</span>
							<span
								class="text-[8px] uppercase font-bold text-neutral-600 group-hover:text-neutral-400"
								>Upload</span
							>
						{/if}
					</button>

					{#each CHARACTERS as char}
						<button
							class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-neutral-900 {selectedCharacter ===
							char.id
								? 'border-orange-500 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
								: 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}"
							onclick={() => {
								selectedCharacter = char.id;
								customAvatar = null; // Reset custom preview
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
				<span class="text-xs font-bold uppercase text-neutral-500 flex items-center gap-2">
					Community Agents
					{#if communityAssets.isLoading}
						<span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
					{/if}
				</span>

				<div class="grid grid-cols-4 gap-2">
					{#if communityAssets.data}
						{#each communityAssets.data as asset}
							<button
								class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-neutral-900 group
                                {selectedCharacter === asset.storageId
									? 'border-orange-500 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
									: 'border-transparent opacity-60 hover:opacity-100 hover:scale-105 hover:border-neutral-600'}"
								onclick={() => {
									selectedCharacter = asset.storageId;
									customAvatar = asset.url; // Biar preview tombol upload jg ke update (opsional)
								}}
								title={`Uploaded by ${asset.uploaderName}`}
							>
								<img
									src={asset.url}
									alt={asset.uploaderName}
									class="w-full h-full object-cover"
									loading="lazy"
								/>
								<div
									class="absolute bottom-0 left-0 w-full bg-black/70 text-[6px] text-white text-center py-0.5 truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									{asset.uploaderName}
								</div>

								{#if selectedCharacter === asset.storageId}
									<div class="absolute inset-0 bg-orange-500/10"></div>
									<div class="absolute top-1 right-1 text-[8px]">✅</div>
								{/if}
							</button>
						{/each}
					{:else if communityAssets.isLoading}
						{#each Array(4) as _}
							<div class="aspect-square bg-neutral-800 rounded-lg animate-pulse"></div>
						{/each}
					{/if}
				</div>
				{#if communityAssets.data && communityAssets.data.length === 0}
					<div class="text-[10px] text-neutral-600 text-center py-2 italic">
						No community uploads yet. Be the first!
					</div>
				{/if}
			</div>

			<div class="space-y-3 pb-2">
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
</div>

<style>
	/* Styling scrollbar agar rapi di dalam box */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #333;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #f97316;
	}
</style>
