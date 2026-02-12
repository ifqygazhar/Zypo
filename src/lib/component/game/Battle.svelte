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

	let lastPlayerHp = $state(100);
	let hitByEnemy = $state(false);

	const hitSounds = [
		'/bgm/hit-1-damage.mp3',
		'/bgm/hit-2-damage.mp3',
		'/bgm/hit-3-damage.mp3',
		'/bgm/hit-4-damage.mp3'
	];
	const missSound = '/bgm/hit-fail-damage.mp3';

	function playSound(src: string) {
		const audio = new Audio(src);
		audio.volume = 1.0;
		audio.play().catch(() => {});
	}

	function playRandomHit() {
		const src = hitSounds[Math.floor(Math.random() * hitSounds.length)];
		playSound(src);
	}

	$effect(() => {
		if (currentPlayer) {
			if (currentPlayer.hp < lastPlayerHp) {
				hitByEnemy = true;
				playRandomHit();
				setTimeout(() => (hitByEnemy = false), 1000);
			}
			lastPlayerHp = currentPlayer.hp;
		}
	});

	$effect(() => {
		if (answerResult === 'HIT') {
			playRandomHit();
		} else if (answerResult === 'MISS') {
			playSound(missSound);
		}
	});

	function isCustom(charId: string) {
		return charId && (charId.startsWith('data:image') || charId.startsWith('http'));
	}

	function getCharAsset(charId: string, type: 'front' | 'back') {
		const char = CHARACTERS.find((c) => c.id === charId);
		return char ? `/character/${char.assets[type]}` : '';
	}
</script>

{#snippet BattleAvatar(charId: string, type: 'front' | 'back')}
	{#if isCustom(charId)}
		<div class="relative w-full h-full flex items-end justify-center">
			<img
				src={charId}
				alt="Agent"
				class="w-3/4 h-3/4 object-cover rounded-xl border-4 border-white/20 shadow-2xl {type ===
				'back'
					? ''
					: 'scale-x-[-1]'}"
			/>
		</div>
	{:else}
		<img
			src={getCharAsset(charId, type)}
			alt="Agent"
			class="w-full h-full object-contain object-bottom drop-shadow-2xl"
		/>
	{/if}
{/snippet}

<div class="relative w-full flex-1 min-h-0 flex flex-col perspective-1000 overflow-hidden">
	<div class="flex-1 relative w-full overflow-hidden group">
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

		{#if opponent}
			<div
				class="absolute bottom-[35%] md:bottom-[20%] right-[5%] md:right-[10%] flex flex-col items-center z-10 transition-all duration-500 scale-75 md:scale-100 origin-bottom {answerResult ===
				'HIT'
					? 'shake'
					: ''}"
			>
				{#if answerResult}
					<div
						class="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-bounce"
					>
						{#if answerResult === 'HIT'}
							<div
								class="bg-red-600 text-white font-black text-xl md:text-3xl px-4 py-1 border-2 border-white -rotate-12 shadow-lg"
							>
								CRITICAL HIT!
							</div>
						{:else if answerResult === 'MISS'}
							<div
								class="bg-neutral-800 text-white font-black text-xl md:text-3xl px-4 py-1 border-2 border-neutral-500 rotate-6 shadow-lg"
							>
								MISS!
							</div>
						{/if}
					</div>
				{/if}

				<div
					class="bg-white/90 text-black p-2 rounded-xl border-l-4 border-l-red-500 shadow-md mb-2 md:mb-4 w-40 md:w-56 transform -skew-x-6 backdrop-blur-sm relative"
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

				<div class="relative group">
					<div
						class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 md:w-48 h-8 md:h-12 bg-black/40 blur-xl rounded-[100%] scale-y-50"
					></div>

					<div class="relative w-32 h-32 md:w-40 md:h-40 animate-pulse-slow">
						{@render BattleAvatar(opponent.characterId, 'front')}
					</div>
				</div>
			</div>
		{/if}

		{#if currentPlayer}
			<div
				class="absolute bottom-[5%] left-[5%] flex flex-col items-center z-20 transition-all duration-500 scale-90 md:scale-100 origin-bottom-left {hitByEnemy
					? 'shake'
					: ''}"
			>
				{#if hitByEnemy}
					<div
						class="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-bounce"
					>
						<div
							class="bg-red-600 text-white font-black text-xl md:text-3xl px-4 py-1 border-2 border-white rotate-12 shadow-lg"
						>
							HIT!
						</div>
					</div>
				{/if}

				<div class="relative mb-4 md:mb-6 group">
					<div
						class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 md:w-64 h-12 md:h-16 bg-black/50 blur-xl rounded-[100%] scale-y-50"
					></div>

					<div class="relative w-40 h-40 md:w-56 md:h-56">
						{@render BattleAvatar(currentPlayer.characterId, 'back')}
					</div>
				</div>

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
	</div>

	<div
		class="h-auto md:h-48 bg-neutral-800 border-t-4 border-orange-500 p-2 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 shrink-0 z-30 pb-safe"
	>
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
				<div class="font-bold mb-1">{game.currentQuestion.text}</div>
				{#if game.currentQuestion.code}
					<pre
						class="bg-black/50 p-2 rounded text-xs md:text-sm font-mono text-green-400 overflow-x-auto border border-neutral-700"><code
							>{game.currentQuestion.code}</code
						></pre>
				{/if}
			{/if}
		</div>

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

<style>
	.shake {
		animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}

	@keyframes shake {
		10%,
		90% {
			transform: translate3d(-1px, 0, 0);
		}

		20%,
		80% {
			transform: translate3d(2px, 0, 0);
		}

		30%,
		50%,
		70% {
			transform: translate3d(-4px, 0, 0);
		}

		40%,
		60% {
			transform: translate3d(4px, 0, 0);
		}
	}
</style>
