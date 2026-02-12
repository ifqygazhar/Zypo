<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';

	const leaderboard = useQuery(api.users.getLeaderboard, {});

	// Helper to get country flag
	function getFlagEmoji(countryCode: string | undefined) {
		if (!countryCode || countryCode === 'UN') return '🏳️';
		const codePoints = countryCode
			.toUpperCase()
			.split('')
			.map((char) => 127397 + char.charCodeAt(0));
		return String.fromCodePoint(...codePoints);
	}

	function getRankBadge(index: number) {
		switch (index) {
			case 0:
				return '🥇';
			case 1:
				return '🥈';
			case 2:
				return '🥉';
			default:
				return `#${index + 1}`;
		}
	}
</script>

<div
	class="w-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-150 lg:h-full min-h-125 shadow-xl"
>
	<div class="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
		<h2 class="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
			<span class="text-orange-500">🏆</span> Top Agents
		</h2>
		<div class="text-[10px] font-mono text-neutral-500 bg-neutral-800 px-2 py-1 rounded">
			GLOBAL RANK
		</div>
	</div>

	<div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-neutral-900/30">
		{#each leaderboard.data as user, i}
			<div
				class="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-neutral-700 hover:bg-neutral-800 transition-all group {i <
				3
					? 'bg-linear-to-r from-neutral-800/50 to-transparent'
					: ''}"
			>
				<div
					class="w-8 h-8 flex items-center justify-center font-black text-sm rounded-lg bg-neutral-950 shadow-inner
                    {i === 0
						? 'text-yellow-400 border border-yellow-500/20'
						: i === 1
							? 'text-gray-300 border border-gray-500/20'
							: i === 2
								? 'text-amber-600 border border-amber-600/20'
								: 'text-neutral-600'}"
				>
					{getRankBadge(i)}
				</div>

				<div class="flex-1 min-w-0 flex flex-col">
					<div class="flex items-center gap-2">
						<span class="text-sm">{getFlagEmoji(user.country)}</span>
						<span
							class="font-bold text-neutral-200 truncate text-sm group-hover:text-orange-400 transition-colors"
							>{user.username}</span
						>
					</div>
				</div>

				<div class="text-right flex flex-col items-end">
					<div class="font-black text-orange-500 text-sm">{user.rank}</div>
					<div class="text-[9px] text-neutral-600 font-bold tracking-wider">PTS</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #333;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #f97316;
	}
</style>
