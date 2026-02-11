<script lang="ts">
	import { CHARACTERS } from '$lib/gameConfig';

	interface Props {
		game: any;
		playerId: string;
	}

	let { game, playerId }: Props = $props();

	let actualWinner = $derived(game.players.find((p: any) => p.id === game.winner));
	let actualLoser = $derived(game.players.find((p: any) => p.id !== game.winner));

	let winnerChar = $derived(CHARACTERS.find((c) => c.id === actualWinner?.characterId));
	let loserChar = $derived(CHARACTERS.find((c) => c.id === actualLoser?.characterId));

	let isVictory = $derived(game.winner === playerId);
</script>

<div
	class="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden font-mono text-white pt-20 pb-10"
>
	<!-- BACKGROUND -->
	{#if game.mapId}
		<div class="absolute inset-0 z-0">
			<img
				src={`/map/${game.mapId}`}
				alt="Background"
				class="w-full h-full object-cover opacity-40 blur-md scale-110"
			/>
			<div class="absolute inset-0 bg-black/70"></div>
		</div>
	{/if}

	<!-- CONTENT CONTAINER -->
	<div class="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-4">
		<!-- HEADER STATUS -->
		<div class="mb-8 text-center animate-bounce">
			<h1
				class="text-8xl font-black italic tracking-tighter transform -skew-x-12 {isVictory
					? 'text-transparent bg-clip-text bg-linear-to-b from-green-400 to-emerald-600 drop-shadow-[0_0_30px_rgba(72,187,120,0.5)]'
					: 'text-transparent bg-clip-text bg-linear-to-b from-red-500 to-rose-700 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]'}"
			>
				{isVictory ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
			</h1>
			<div class="text-xl tracking-[0.5em] mt-2 font-bold opacity-80 uppercase">
				{isVictory ? 'Target Neutralized' : 'System Critical Failure'}
			</div>
		</div>

		<!-- PLAYERS SHOWCASE -->
		<div class="flex items-end justify-center gap-12 mb-16 w-full h-100">
			<!-- LOSER (Left - Smaller/Grayscale) -->
			{#if actualLoser && loserChar}
				<div
					class="relative group opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500 scale-75 origin-bottom-right"
				>
					<div class="w-64 h-80 relative">
						<div
							class="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-xl rounded-[100%] scale-y-50"
						></div>
						<img
							src={`/character/${loserChar.assets.front}`}
							alt={actualLoser.name}
							class="w-full h-full object-contain object-bottom drop-shadow-2xl"
						/>
					</div>
					<div class="bg-black/80 p-2 text-center border-t-2 border-red-800 backdrop-blur skew-x-6">
						<div class="text-red-500 font-bold text-xs">DEFEATED</div>
						<div class="font-black text-lg uppercase">{actualLoser.name}</div>
					</div>
				</div>
			{/if}

			<!-- WINNER (Center - Large/Active) -->
			{#if actualWinner && winnerChar}
				<div class="relative z-20 scale-110 origin-bottom">
					<!-- RADIANT BACKGROUND GLOW -->
					<div
						class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-gradient-radial from-orange-500/20 to-transparent blur-3xl animate-pulse"
					></div>

					<div class="w-80 h-96 relative animate-pulse-slow">
						<div
							class="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-16 bg-black/60 blur-xl rounded-[100%] scale-y-50"
						></div>
						<img
							src={`/character/${winnerChar.assets.front}`}
							alt={actualWinner.name}
							class="w-full h-full object-contain object-bottom drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]"
						/>
					</div>

					<div class="absolute -bottom-12 left-1/2 -translate-x-1/2 w-80">
						<div
							class="bg-linear-to-r from-orange-500 via-yellow-500 to-orange-500 p-0.5 rounded-lg shadow-xl transform -skew-x-6"
						>
							<div class="bg-neutral-900 px-6 py-3 text-center">
								<div class="text-xs font-bold text-orange-400 tracking-widest mb-1">
									MVP / WINNER
								</div>
								<div class="text-3xl font-black uppercase text-white tracking-wide">
									{actualWinner.name}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- ACTIONS -->
		<div class="flex gap-4 mt-8">
			<a
				href="/"
				class="group relative overflow-hidden bg-white text-black font-black px-12 py-5 rounded-lg transform skew-x-[-10deg] hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
			>
				<div class="transform skew-x-10 flex items-center gap-2">
					<span>RETURN TO BASE</span>
					<span class="group-hover:translate-x-1 transition-transform">→</span>
				</div>
			</a>
		</div>
	</div>
</div>
