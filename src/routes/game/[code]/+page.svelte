<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { convex, createQuery } from '$lib/convex.svelte';
	import { api } from '../../../../convex/_generated/api';
	import { onMount } from 'svelte';
	import { CHARACTERS } from '$lib/gameConfig';

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

	let playerChar = $derived(CHARACTERS.find((c) => c.id === currentPlayer?.characterId));
	let opponentChar = $derived(CHARACTERS.find((c) => c.id === opponent?.characterId));

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
		{:else}
			<!-- LOBBY STATE -->
			{#if game.status === 'waiting'}
				<div class="max-w-md mx-auto mt-20 text-center p-4">
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
				<!-- PLAYING STATE (BATTLE UI) -->
			{:else if game.status === 'playing'}
				<div class="relative w-full h-full flex flex-col perspective-1000">
					<!-- BATTLE VIEW -->
					<div class="flex-1 relative min-h-[400px] overflow-hidden group">
						<!-- BATTLEGROUND BACKGROUND -->
						{#if game?.mapId}
							<div class="absolute inset-0 z-0 select-none pointer-events-none">
								<img
									src={`/map/${game.mapId}`}
									alt="Battleground"
									class="w-full h-full object-cover object-bottom opacity-80"
								/>
								<div class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
							</div>
						{/if}
						<!-- OPPONENT (Top Right) -->
						{#if opponent}
							<div
								class="absolute bottom-[20%] right-[10%] flex flex-col items-center z-10 transition-all duration-500 scale-75 origin-bottom"
							>
								<!-- HUD -->
								<div
									class="bg-white/90 text-black p-2 rounded-xl border-l-4 border-l-red-500 shadow-md mb-4 w-56 transform -skew-x-6 backdrop-blur-sm"
								>
									<div
										class="flex justify-between font-bold text-xs uppercase tracking-wider mb-1 px-1"
									>
										<span class="truncate max-w-[120px]">{opponent.name}</span>
										<span class="text-neutral-500">Lv.50</span>
									</div>
									<div class="w-full bg-neutral-300 h-2 rounded-full overflow-hidden">
										<div
											class="h-full bg-linear-to-r from-red-500 to-green-500 transition-all duration-500 ease-out"
											style="width: {opponent.hp}%"
										></div>
									</div>
								</div>

								<!-- CHARACTER CONTAINER -->
								<div class="relative group">
									<!-- PLATFORM/SHADOW -->
									<div
										class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/40 blur-xl rounded-[100%] scale-y-50"
									></div>
									<div
										class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-10 bg-radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%) scale-y-50"
									></div>

									<!-- SPRITE -->
									<div class="relative w-40 h-40 animate-pulse-slow">
										{#if opponentChar}
											<img
												src={`/character/${opponentChar.assets.front}`}
												alt={opponent.name}
												class="w-full h-full object-contain object-bottom drop-shadow-2xl"
											/>
										{:else}
											<div class="w-full h-full bg-red-500/20 rounded-full blur-xl"></div>
										{/if}
									</div>
								</div>
							</div>
						{/if}

						<!-- PLAYER (Bottom Left) -->
						{#if currentPlayer}
							<div
								class="absolute bottom-[5%] left-[5%] flex flex-col items-center z-20 transition-all duration-500"
							>
								<!-- CHARACTER CONTAINER -->
								<div class="relative mb-6 group">
									<!-- PLATFORM/SHADOW -->
									<div
										class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-16 bg-black/50 blur-xl rounded-[100%] scale-y-50"
									></div>
									<div
										class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-56 h-12 bg-radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%) scale-y-50"
									></div>

									<!-- SPRITE -->
									<div class="relative w-56 h-56">
										{#if playerChar}
											<img
												src={`/character/${playerChar.assets.back}`}
												alt={currentPlayer.name}
												class="w-full h-full object-contain object-bottom drop-shadow-2xl"
											/>
										{:else}
											<div class="w-full h-full bg-blue-500/20 rounded-full blur-xl"></div>
										{/if}
									</div>
								</div>

								<!-- HUD -->
								<div
									class="bg-white/90 text-black p-3 rounded-xl border-r-4 border-r-blue-500 shadow-lg w-72 transform skew-x-6 backdrop-blur-sm"
								>
									<div
										class="flex justify-between font-bold uppercase mb-2 px-1 text-sm tracking-wider"
									>
										<span class="truncate max-w-[160px]">{currentPlayer.name}</span>
										<span class="text-neutral-500">Lv.50</span>
									</div>
									<div class="flex items-center gap-2">
										<span class="font-black text-[10px] text-orange-600 bg-orange-100 px-1 rounded"
											>HP</span
										>
										<div
											class="flex-1 bg-neutral-800 h-5 rounded-lg border-2 border-neutral-300 p-[2px] shadow-inner"
										>
											<div
												class="h-full rounded-md bg-linear-to-r from-red-500 via-orange-400 to-green-500 transition-all duration-500 ease-out"
												style="width: {currentPlayer.hp}%"
											></div>
										</div>
									</div>
									<div class="text-right text-xs font-mono mt-1 font-bold text-neutral-600">
										{currentPlayer.hp}/100
									</div>
								</div>
							</div>
						{/if}

						<!-- FEEDBACK OVERLAY -->
						{#if answerResult}
							<div
								class="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
							>
								{#if answerResult === 'HIT'}
									<div
										class="bg-white text-black font-black text-6xl px-8 py-4 border-4 border-black -rotate-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] animate-bounce"
									>
										CRITICAL HIT!
									</div>
								{:else}
									<div
										class="bg-neutral-800 text-white font-black text-4xl px-8 py-4 border-4 border-white rotate-6 animate-pulse"
									>
										ATTACK MISSED!
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<!-- BATTLE MENU / DIALOGUE -->
					<div class="h-48 bg-neutral-800 border-t-4 border-orange-500 p-4 grid grid-cols-3 gap-4">
						<!-- TEXT BOX -->
						<div
							class="col-span-2 bg-neutral-900 border-2 border-neutral-600 rounded p-4 font-mono text-lg leading-relaxed text-white"
						>
							{#if !game.currentQuestion}
								Waiting for battle data...
							{:else}
								<div class="mb-2 text-orange-400 font-bold uppercase tracking-wider">
									Battle Query:
								</div>
								{game.currentQuestion.text}
							{/if}
						</div>

						<!-- ACTIONS -->
						<div class="grid grid-cols-2 gap-2">
							{#each game.currentQuestion?.options || [] as option, i}
								<button
									onclick={() => submitAnswer(i)}
									disabled={isSubmitting}
									class="bg-white text-black border-b-4 border-neutral-400 hover:border-b-0 hover:translate-y-1 hover:bg-orange-100 font-bold rounded p-2 text-sm uppercase transition-all flex items-center justify-center text-center"
								>
									{option}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- FINISHED STATE -->
			{:else if game.status === 'finished'}
				<div class="flex flex-col items-center justify-center h-screen text-center p-4">
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
	</div>
</div>
