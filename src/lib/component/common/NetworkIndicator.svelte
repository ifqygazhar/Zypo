<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let ping = $state(0);
	let status = $state<'good' | 'medium' | 'bad'>('good');
	let intervalId: any;

	const checkPing = async () => {
		const start = performance.now();
		try {
			await fetch('/favicon.svg', { method: 'HEAD', cache: 'no-store' });
			const end = performance.now();
			ping = Math.round(end - start);

			if (ping < 100) status = 'good';
			else if (ping < 300) status = 'medium';
			else status = 'bad';
		} catch (e) {
			ping = 999;
			status = 'bad';
		}
	};

	onMount(() => {
		checkPing();
		intervalId = setInterval(checkPing, 5000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<div
	class="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded-full shadow-lg"
>
	<div class="relative flex h-2 w-2">
		{#if status === 'good'}
			<span
				class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
			></span>
			<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
		{:else if status === 'medium'}
			<span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
		{:else}
			<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
		{/if}
	</div>
	<span
		class="text-[10px] font-mono font-bold {status === 'good'
			? 'text-green-400'
			: status === 'medium'
				? 'text-yellow-400'
				: 'text-red-400'}"
	>
		{ping}ms
	</span>
</div>
