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
				class="w-full h-full object-cover opacity-30 blur-xl scale-110"
			/>
			<div class="absolute inset-0 bg-black/80"></div>
		</div>
	{/if}

	<!-- CONTENT CONTAINER -->
	<div class="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
		<!-- HEADER STATUS -->
		<div class="mb-4 md:mb-12 text-center">
			<h1
				class="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-2 {isVictory
					? 'text-transparent bg-clip-text bg-linear-to-b from-green-400 to-emerald-600 drop-shadow-[0_0_15px_rgba(72,187,120,0.5)]'
					: 'text-transparent bg-clip-text bg-linear-to-b from-red-500 to-rose-700 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]'}"
			>
				{isVictory ? 'MISSION COMPLETE' : 'MISSION FAILED'}
			</h1>
			<div
				class="text-xs md:text-xl tracking-[0.3em] font-bold opacity-60 uppercase border-t border-b border-white/10 py-2 inline-block"
			>
				{isVictory ? 'Target Neutralized' : 'System Critical Failure'}
			</div>
		</div>

		<!-- MAIN PLAYERS GRID -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full items-end mb-12">
			<div class="order-2 md:order-1 flex justify-center md:justify-end">
				{#if actualLoser && loserChar}
					<div
						class="relative group opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500 scale-90 origin-bottom"
					>
						<div class="w-48 h-64 relative">
							<img
								src={`/character/${loserChar.assets.front}`}
								alt={actualLoser.name}
								class="w-full h-full object-contain object-bottom drop-shadow-xl"
							/>
						</div>
						<div
							class="bg-black/50 p-2 text-center border-t-2 border-red-800/50 backdrop-blur skew-x-6"
						>
							<div class="text-red-500/80 font-bold text-[10px]">DEFEATED</div>
							<div class="font-bold text-sm uppercase text-neutral-400">{actualLoser.name}</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- WINNER (Center - Largest) -->
			<div class="order-1 md:order-2 flex flex-col items-center relative z-20">
				{#if actualWinner && winnerChar}
					<div class="relative origin-bottom transform transition-transform hover:scale-105">
						<!-- RADIANT BACKGROUND GLOW -->
						<div
							class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-orange-500/30 to-transparent blur-3xl animate-pulse"
						></div>

						<div class="w-64 h-80 md:w-80 md:h-96 relative">
							<img
								src={`/character/${winnerChar.assets.front}`}
								alt={actualWinner.name}
								class="w-full h-full object-contain object-bottom drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
							/>
						</div>

						<div class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 md:w-80">
							<div
								class="bg-linear-to-r from-orange-500 via-yellow-500 to-orange-500 p-0.5 rounded-lg shadow-2xl transform -skew-x-6"
							>
								<div class="bg-neutral-900 px-6 py-4 text-center">
									<div class="text-[10px] font-bold text-orange-400 tracking-widest mb-1">
										MVP / WINNER
									</div>
									<div class="text-2xl md:text-3xl font-black uppercase text-white tracking-wide">
										{actualWinner.name}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- EMPTY SLOT RIGHT (For balance or Stats) -->
			<div class="order-3 hidden md:flex flex-col justify-end items-start text-left opacity-60">
				<div class="space-y-4 text-sm font-mono border-l-2 border-white/20 pl-4">
					<div>
						<div class="text-neutral-500 text-[10px]">BATTLE DURATION</div>
						<div>01:24</div>
					</div>
					<div>
						<div class="text-neutral-500 text-[10px]">ACCURACY</div>
						<div>94%</div>
					</div>
					<div>
						<div class="text-neutral-500 text-[10px]">STATUS</div>
						<div class="text-green-400">RANK UP</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ACTIONS -->
		<div class="mt-8 md:mt-16">
			<a
				href="/"
				class="group relative inline-flex items-center gap-3 bg-white text-black font-black px-10 py-5 rounded hover:bg-neutral-200 transition-all active:scale-95 shadow-lg"
			>
				<span>RETURN TO BASE</span>
				<span class="group-hover:translate-x-1 transition-transform">→</span>
			</a>
		</div>
	</div>
</div>
