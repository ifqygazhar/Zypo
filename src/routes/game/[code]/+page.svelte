<script lang="ts">
	import { page } from '$app/state';
	import { convex, createQuery } from '$lib/convex.svelte';
	import { api } from '../../../../convex/_generated/api';
	import { onMount } from 'svelte';
	import Lobby from '$lib/component/game/Lobby.svelte';
	import Battle from '$lib/component/game/Battle.svelte';
	import GameOver from '$lib/component/game/GameOver.svelte';

	import { audioState } from '$lib/audioState.svelte';

	const gameCode = page.params.code ?? '';

	let playerId = $state(page.url.searchParams.get('pid') ?? '');

	let isSubmitting = $state(false);
	let answerResult = $state<'HIT' | 'MISS' | null>(null);

	const gameQuery = createQuery(api.games.getByCode, () => ({ code: gameCode }));

	let game = $derived(gameQuery.data);
	let questionKey = $derived(game?.currentQuestion?.startTime);

	let battleTrack = $state('');

	onMount(() => {
		if (!playerId) {
			playerId = sessionStorage.getItem('zypo_playerId') || '';
		}
		if (playerId) {
			sessionStorage.setItem('zypo_playerId', playerId);
		}
		if (gameCode === '') {
			window.location.href = '/';
		}
		// Randomly select battle track on mount
		battleTrack = Math.random() > 0.5 ? '/bgm/bgm-battle-1.ogg' : '/bgm/bgm-battle-2.ogg';
	});

	$effect(() => {
		if (!game) return;
		if (game.status === 'waiting') audioState.setTrack('/bgm/bgm-lobby.ogg');
		else if (game.status === 'playing') audioState.setTrack(battleTrack);
		else if (game.status === 'finished') audioState.setTrack('/bgm/bgm-end-game.mp3');
	});

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

<div class="min-h-screen bg-black text-white font-mono relative overflow-hidden">
	<div class="relative z-10 min-h-screen flex flex-col">
		{#if gameQuery.isLoading}
			<div class="flex h-screen items-center justify-center">
				<div class="text-orange-500 animate-pulse text-xl">CONNECTING TO NEURAL LINK...</div>
			</div>
		{:else if !game}
			<div class="flex h-screen items-center justify-center flex-col">
				<h1 class="text-red-500 text-2xl font-bold mb-4">GAME NOT FOUND</h1>
				<a href="/" class="underline text-neutral-500">Return to Base</a>
			</div>
		{:else if game.status === 'waiting'}
			<Lobby {game} {playerId} onStartGame={startGame} />
		{:else if game.status === 'playing'}
			<Battle {game} {playerId} {isSubmitting} {answerResult} onSubmitAnswer={submitAnswer} />
		{:else if game.status === 'finished'}
			<GameOver {game} {playerId} />
		{/if}
	</div>
</div>
