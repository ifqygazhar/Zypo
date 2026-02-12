<script lang="ts">
	import { MAPS } from '$lib/gameConfig';

	interface Props {
		selectedMap: string;
	}

	let { selectedMap = $bindable() }: Props = $props();
</script>

<div class="space-y-3 pb-6">
	<span class="text-[10px] font-bold uppercase text-neutral-600 tracking-widest"
		>Deployment Zone</span
	>
	<div class="grid grid-cols-3 gap-3">
		{#each MAPS as map}
			<button
				class="cursor-pointer relative aspect-video sm:aspect-square rounded-xl overflow-hidden border-2 transition-all {selectedMap ===
				map
					? 'border-orange-500 scale-105 shadow-lg z-0'
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
