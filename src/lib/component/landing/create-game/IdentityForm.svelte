<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		playerName: string;
		playerPin: string;
		isCreating: boolean;
		isUploading: boolean;
		onCreate: () => void;
		onQuickMatch: () => void;
		joinSection: Snippet;
	}

	let {
		playerName = $bindable(),
		playerPin = $bindable(),
		isCreating,
		isUploading,
		onCreate,
		onQuickMatch,
		joinSection
	}: Props = $props();
</script>

<div class="lg:col-span-5 flex flex-col gap-6">
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
						oninput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''))}
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

	<div class="space-y-3">
		<button
			onclick={onQuickMatch}
			disabled={isCreating || isUploading}
			class="cursor-pointer relative w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-all border border-neutral-700 hover:border-neutral-500 flex items-center justify-between px-6 group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
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
			class="cursor-pointer w-full bg-linear-to-r from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(234,88,12,0.2)] hover:shadow-[0_4px_30px_rgba(234,88,12,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide border-t border-white/10"
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
