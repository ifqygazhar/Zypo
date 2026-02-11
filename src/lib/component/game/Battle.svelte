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

<div class="relative w-full flex-1 min-h-0 flex flex-col perspective-1000 overflow-hidden">
	<!-- BATTLE VIEW -->
	<div class="flex-1 relative w-full overflow-hidden group">
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
				class="absolute bottom-[35%] md:bottom-[20%] right-[5%] md:right-[10%] flex flex-col items-center z-10 transition-all duration-500 scale-75 md:scale-100 origin-bottom"
			>
				<!-- HUD -->
				<div
					class="bg-white/90 text-black p-2 rounded-xl border-l-4 border-l-red-500 shadow-md mb-2 md:mb-4 w-40 md:w-56 transform -skew-x-6 backdrop-blur-sm"
				>
					<div
						class="flex justify-between font-bold text-[10px] md:text-xs uppercase tracking-wider mb-1 px-1"
					>
						<span class="truncate max-w-24 md:max-w-30">{opponent.name}</span>
						<span class="text-neutral-500">Lv.50</span>
					</div>
					<div class="w-full bg-neutral-300 h-1.5 md:h-2 rounded-full overflow-hidden">
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
						class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 md:w-48 h-8 md:h-12 bg-black/40 blur-xl rounded-[100%] scale-y-50"
					></div>
					<div
						class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 md:w-40 h-6 md:h-10 bg-radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%) scale-y-50"
					></div>

					<!-- SPRITE -->
					<div class="relative w-32 h-32 md:w-40 md:h-40 animate-pulse-slow">
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
				class="absolute bottom-[5%] left-[5%] flex flex-col items-center z-20 transition-all duration-500 scale-90 md:scale-100 origin-bottom-left"
			>
				<!-- CHARACTER CONTAINER -->
				<div class="relative mb-4 md:mb-6 group">
					<!-- PLATFORM/SHADOW -->
					<div
						class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 md:w-64 h-12 md:h-16 bg-black/50 blur-xl rounded-[100%] scale-y-50"
					></div>
					<div
						class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-40 md:w-56 h-8 md:h-12 bg-radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%) scale-y-50"
					></div>

					<!-- SPRITE -->
					<div class="relative w-40 h-40 md:w-56 md:h-56">
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
					class="bg-white/90 text-black p-2 md:p-3 rounded-xl border-r-4 border-r-blue-500 shadow-lg w-64 md:w-72 transform skew-x-6 backdrop-blur-sm"
				>
					<div
						class="flex justify-between font-bold uppercase mb-2 px-1 text-xs md:text-sm tracking-wider"
					>
						<span class="truncate max-w-32 md:max-w-40">{currentPlayer.name}</span>
						<span class="text-neutral-500">Lv.50</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-black text-[10px] text-orange-600 bg-orange-100 px-1 rounded">HP</span
						>
						<div
							class="flex-1 bg-neutral-800 h-4 md:h-5 rounded-lg border-2 border-neutral-300 p-0.5 shadow-inner"
						>
							<div
								class="h-full rounded-md bg-linear-to-r from-red-500 via-orange-400 to-green-500 transition-all duration-500 ease-out"
								style="width: {currentPlayer.hp}%"
							></div>
						</div>
					</div>
					<div class="text-right text-[10px] md:text-xs font-mono mt-1 font-bold text-neutral-600">
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
						class="bg-white text-black font-black text-4xl md:text-6xl px-8 py-4 border-4 border-black -rotate-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] animate-bounce"
					>
						CRITICAL HIT!
					</div>
				{:else}
					<div
						class="bg-neutral-800 text-white font-black text-2xl md:text-4xl px-8 py-4 border-4 border-white rotate-6 animate-pulse"
					>
						ATTACK MISSED!
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- BATTLE MENU / DIALOGUE -->
	<div
		class="h-auto md:h-48 bg-neutral-800 border-t-4 border-orange-500 p-2 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 shrink-0 z-30 pb-safe"
	>
		<!-- TEXT BOX -->
		<div
			class="col-span-1 md:col-span-2 bg-neutral-900 border-2 border-neutral-600 rounded p-2 md:p-4 font-mono text-sm md:text-lg leading-relaxed text-white h-24 md:h-auto overflow-y-auto"
		>
			{#if !game.currentQuestion}
				<div class="flex h-full items-center justify-center text-neutral-500 italic">
					Waiting for battle data...
				</div>
			{:else}
				<div
					class="mb-1 md:mb-2 text-orange-400 font-bold uppercase tracking-wider text-xs md:text-sm"
				>
					Battle Query:
				</div>
				{game.currentQuestion.text}
			{/if}
		</div>

		<!-- ACTIONS -->
		<div class="grid grid-cols-2 gap-2 h-24 md:h-auto">
			{#each game.currentQuestion?.options || [] as option, i}
				<button
					onclick={() => onSubmitAnswer(i)}
					disabled={isSubmitting}
					class="bg-white text-black border-b-4 border-neutral-400 hover:border-b-0 hover:translate-y-1 hover:bg-orange-100 font-bold rounded p-1 md:p-2 text-xs md:text-sm uppercase transition-all flex items-center justify-center text-center active:scale-95"
				>
					{option}
				</button>
			{/each}
		</div>
	</div>
</div>
