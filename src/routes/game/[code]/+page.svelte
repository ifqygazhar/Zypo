<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { convex, createQuery } from '$lib/convex.svelte';
	import { api } from '../../../../convex/_generated/api';
	import { onMount } from 'svelte';

	const gameCode = page.params.code;

	let playerId = $state(page.url.searchParams.get('pid') ?? '');

	let isSubmitting = $state(false);
	let answerResult = $state<'HIT' | 'MISS' | null>(null);

	onMount(() => {
		if (!playerId) {
			playerId = sessionStorage.getItem('zypo_playerId') || '';
		}
		if (playerId) {
			sessionStorage.setItem('zypo_playerId', playerId);
		}
	});

	const gameQuery = createQuery(api.games.getByCode, () => ({ code: gameCode }));

	let game = $derived(gameQuery.data);
	let currentPlayer = $derived(game?.players.find((p) => p.id === playerId));
	let opponent = $derived(game?.players.find((p) => p.id !== playerId));

	let questionKey = $derived(game?.currentQuestion?.startTime);
	$effect(() => {
		questionKey;
		answerResult = null;
		isSubmitting = false;
	});

	// Actions
	async function startGame() {
		if (!game) return;
		await convex.mutation(api.games.startGame, { gameId: game._id });
	}

	async function submitAnswer(index: number) {
		if (!game || isSubmitting || answerResult) return;
		isSubmitting = true;

		try {
			console.log('Submitting Answer as:', playerId, 'Game ID:', game._id);
			const result = await convex.mutation(api.games.submitAnswer, {
				gameId: game._id,
				playerId,
				answerIndex: index
			});

			if (result === 'HIT') {
				answerResult = 'HIT';
				// Reset visual feedback after short delay
				setTimeout(() => (answerResult = null), 1000);
			} else if (result === 'MISS') {
				answerResult = 'MISS';
				setTimeout(() => (answerResult = null), 1000);
			} else if (result === 'WIN') {
				// Handled by game state update
			}
		} catch (e) {
			console.error(e);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="min-h-screen bg-black text-white p-4 font-mono">
	{#if gameQuery.isLoading}
		<div class="flex h-screen items-center justify-center">
			<div class="text-orange-500 animate-pulse text-xl">CONNECTING TO NEURAL LINK...</div>
		</div>
	{:else if !game}
		<div class="flex h-screen items-center justify-center flex-col">
			<h1 class="text-red-500 text-2xl font-bold mb-4">GAME NOT FOUND</h1>
			<a href="/" class="underline text-neutral-500">Return to Base</a>
		</div>
	{:else}
		<!-- LOBBY STATE -->
		{#if game.status === 'waiting'}
			<div class="max-w-md mx-auto mt-20 text-center">
				<h2 class="text-6xl font-black text-white mb-2">{game.code}</h2>
				<p class="text-neutral-500 mb-12 uppercase tracking-widest">Access Code</p>

				<div class="space-y-4 mb-12">
					{#each game.players as p}
						<div
							class="bg-neutral-900 border border-neutral-700 p-4 rounded-lg flex items-center justify-between"
						>
							<span class="font-bold {p.id === playerId ? 'text-orange-400' : 'text-white'}"
								>{p.name} {p.id === playerId ? '(YOU)' : ''}</span
							>
							<span class="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">READY</span>
						</div>
					{/each}
					{#if game.players.length < 2}
						<div
							class="border border-dashed border-neutral-800 p-4 rounded-lg text-neutral-600 animate-pulse"
						>
							WAITING FOR OPPONENT...
						</div>
					{/if}
				</div>

				{#if game.players.length >= 2}
					<!-- Allow start if 2 players. In logic I allowed strictly 2 players max -->
					<button
						onclick={startGame}
						class="w-full bg-white text-black font-black py-4 rounded hover:bg-neutral-200 transition-colors"
					>
						INITIATE DUEL
					</button>
				{:else}
					<p class="text-xs text-neutral-600">Waiting for 2 players to start...</p>
				{/if}
			</div>

			<!-- PLAYING STATE -->
		{:else if game.status === 'playing'}
			<div class="max-w-2xl mx-auto flex flex-col h-[90vh]">
				<!-- HUD -->
				<div class="grid grid-cols-2 gap-8 mb-8">
					<!-- Player (Left) -->
					<div>
						<div class="flex justify-between items-end mb-1">
							<span class="font-bold text-orange-400 truncate">{currentPlayer?.name}</span>
							<span class="text-2xl font-black">{currentPlayer?.hp}</span>
						</div>
						<div class="h-4 bg-neutral-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-linear-to-r from-orange-500 to-red-600 transition-all duration-300"
								style="width: {currentPlayer?.hp}%"
							></div>
						</div>
					</div>

					<!-- Opponent (Right) -->
					<div class="text-right">
						<div class="flex justify-between items-end mb-1 flex-row-reverse">
							<span class="font-bold text-blue-400 truncate">{opponent?.name || 'OPPONENT'}</span>
							<span class="text-2xl font-black">{opponent?.hp}</span>
						</div>
						<div class="h-4 bg-neutral-800 rounded-full overflow-hidden flex justify-end">
							<div
								class="h-full bg-linear-to-l from-blue-500 to-cyan-600 transition-all duration-300"
								style="width: {opponent?.hp}%"
							></div>
						</div>
					</div>
				</div>

				<!-- BATTLE AREA -->
				<div class="flex-1 flex flex-col justify-center items-center relative">
					<!-- Feedback Overlay -->
					{#if answerResult === 'HIT'}
						<div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
							<h1
								class="text-8xl font-black text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-bounce"
							>
								HIT!
							</h1>
						</div>
					{:else if answerResult === 'MISS'}
						<div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
							<h1
								class="text-8xl font-black text-red-600 rotate-12 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]"
							>
								MISS!
							</h1>
						</div>
					{/if}

					<div
						class="w-full bg-neutral-900 border border-neutral-700 p-8 rounded-2xl shadow-2xl mb-8 transform transition-all"
					>
						<p class="text-center text-sm text-neutral-500 mb-4 uppercase tracking-widest">
							Question Payload
						</p>
						<h3 class="text-2xl md:text-4xl font-bold text-center leading-tight">
							{game.currentQuestion?.text}
						</h3>
					</div>

					<div class="grid grid-cols-2 gap-4 w-full">
						{#each game.currentQuestion?.options || [] as option, i}
							<button
								onclick={() => submitAnswer(i)}
								disabled={isSubmitting}
								class="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-6 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center"
							>
								{option}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- FINISHED STATE -->
		{:else if game.status === 'finished'}
			<div class="flex flex-col items-center justify-center h-screen text-center">
				<h1
					class="text-6xl font-black mb-4 {game.winner === playerId
						? 'text-green-500'
						: 'text-red-500'}"
				>
					{game.winner === playerId ? 'VICTORY' : 'DEFEAT'}
				</h1>
				<p class="text-neutral-400 text-xl mb-8">
					{game.winner === playerId ? 'Target Eliminated.' : 'System Critical failure.'}
				</p>
				<a href="/" class="bg-white text-black px-8 py-4 rounded font-bold hover:bg-neutral-200">
					RETURN TO LOBBY
				</a>
			</div>
		{/if}
	{/if}

	<!-- DEBUG FOOTER -->
	<div
		class="fixed bottom-0 left-0 w-full p-2 bg-neutral-900/80 text-[10px] text-neutral-500 flex justify-between items-center pointer-events-none"
	>
		<span>ID: {playerId}</span>
		<div class="space-x-2">
			<!-- DEBUG DATA -->
			<span class="opacity-50 text-[8px]"
				>{JSON.stringify(
					game?.players.map((p) => ({ n: p.name, hp: p.hp, id: p.id.slice(0, 4) + '...' }))
				)}</span
			>
			<span class="text-orange-500 text-[9px]"
				>ME: {currentPlayer?.name} ({currentPlayer?.hp}) ID: {currentPlayer?.id.slice(
					0,
					4
				)}...</span
			>
			<span class="text-blue-500 text-[9px]">OP: {opponent?.name} ({opponent?.hp})</span>
			<button
				class="pointer-events-auto hover:text-white"
				onclick={() => {
					sessionStorage.clear();
					window.location.href = '/';
				}}>RESET SESSION</button
			>
		</div>
	</div>
</div>
```
