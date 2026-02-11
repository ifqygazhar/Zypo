<script lang="ts">
	import { CHARACTERS } from '$lib/gameConfig';

	interface Props {
		game: any;
		playerId: string;
		isSubmitting: boolean;
		answerResult: 'HIT' | 'MISS' | null;
		onSubmitAnswer: (index: number) => void;
	}

	let { game, playerId, isSubmitting, answerResult, onSubmitAnswer }: Props = $props();

	let currentPlayer = $derived(game?.players.find((p: any) => p.id === playerId));
	let opponent = $derived(game?.players.find((p: any) => p.id !== playerId));

	let playerChar = $derived(CHARACTERS.find((c) => c.id === currentPlayer?.characterId));
	let opponentChar = $derived(CHARACTERS.find((c) => c.id === opponent?.characterId));
</script>

<div class="relative w-full h-full flex flex-col perspective-1000">
	<!-- BATTLE VIEW -->
	<div class="flex-1 relative min-h-100 overflow-hidden group">
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
					<div class="flex justify-between font-bold text-xs uppercase tracking-wider mb-1 px-1">
						<span class="truncate max-w-30">{opponent.name}</span>
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
					<div class="flex justify-between font-bold uppercase mb-2 px-1 text-sm tracking-wider">
						<span class="truncate max-w-40">{currentPlayer.name}</span>
						<span class="text-neutral-500">Lv.50</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-black text-[10px] text-orange-600 bg-orange-100 px-1 rounded">HP</span
						>
						<div
							class="flex-1 bg-neutral-800 h-5 rounded-lg border-2 border-neutral-300 p-0.5 shadow-inner"
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
			<div class="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
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
				<div class="mb-2 text-orange-400 font-bold uppercase tracking-wider">Battle Query:</div>
				{game.currentQuestion.text}
			{/if}
		</div>

		<!-- ACTIONS -->
		<div class="grid grid-cols-2 gap-2">
			{#each game.currentQuestion?.options || [] as option, i}
				<button
					onclick={() => onSubmitAnswer(i)}
					disabled={isSubmitting}
					class="bg-white text-black border-b-4 border-neutral-400 hover:border-b-0 hover:translate-y-1 hover:bg-orange-100 font-bold rounded p-2 text-sm uppercase transition-all flex items-center justify-center text-center"
				>
					{option}
				</button>
			{/each}
		</div>
	</div>
</div>
