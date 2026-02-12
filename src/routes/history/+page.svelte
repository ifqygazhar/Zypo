<script lang="ts">
	import { convex } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import formatError from '$lib/utils/error_format';

	let username = $state('');
	let pin = $state('');
	let isAuthenticated = $state(false);
	let isLoading = $state(false);

	let history = $state<any[]>([]);

	async function checkHistory() {
		if (!username.trim() || pin.length !== 4) {
			toast.error('Enter valid Username and 4-digit PIN');
			return;
		}

		isLoading = true;
		try {
			await convex.mutation(api.users.register, { username, pin });

			const res = await convex.query(api.games.getHistory, { username, limit: 50 });
			history = res;
			isAuthenticated = true;
			sessionStorage.setItem('zypo_playerName', username);
		} catch (e: any) {
			toast.error(formatError(e));
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-neutral-950 text-white p-4 md:p-8 flex flex-col items-center">
	<div
		class="fixed top-0 left-0 w-full h-96 bg-linear-to-b from-orange-900/10 to-transparent pointer-events-none"
	></div>

	<div class="w-full max-w-3xl z-10">
		<button
			onclick={() => goto('/')}
			class="mb-8 text-neutral-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
		>
			← Back to Lobby
		</button>

		<h1 class="text-4xl md:text-6xl font-black italic uppercase mb-8 text-orange-500">
			Battle History
		</h1>

		{#if !isAuthenticated}
			<div class="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 max-w-md mx-auto">
				<h2 class="text-xl font-bold mb-4">Agent Verification</h2>
				<p class="text-neutral-400 mb-6 text-sm">
					Enter your Codename and PIN to access confidential mission logs.
				</p>

				<div class="space-y-4">
					<div>
						<label
							for="username"
							class="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1"
							>Codename</label
						>
						<input
							id="username"
							bind:value={username}
							type="text"
							placeholder="e.g. Shadow"
							class="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-hidden transition-colors"
						/>
					</div>
					<div>
						<label
							for="pin"
							class="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1"
							>PIN</label
						>
						<input
							id="pin"
							bind:value={pin}
							type="password"
							maxlength="4"
							placeholder="••••"
							autocomplete="off"
							class="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-hidden transition-colors font-mono tracking-widest"
						/>
					</div>

					<button
						onclick={checkHistory}
						disabled={isLoading}
						class="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
					>
						{isLoading ? 'ACCESSING DATABASE...' : 'ACCESS LOGS'}
					</button>
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="flex justify-between items-center mb-6">
					<div>
						<h2 class="text-xl font-bold text-white">Agent {username}</h2>
						<p class="text-neutral-500 text-xs">Recent Operations</p>
					</div>
					<button
						onclick={() => (isAuthenticated = false)}
						class="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
					>
						Logout
					</button>
				</div>

				{#if history.length === 0}
					<div class="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
						<p class="text-neutral-500">No mission records found.</p>
					</div>
				{:else}
					{#each history as game}
						<div
							class="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 flex items-center justify-between hover:border-neutral-700 transition-colors"
						>
							<div class="flex items-center gap-4">
								<div
									class="w-2 h-12 rounded-full {game.result === 'WIN'
										? 'bg-green-500'
										: game.result === 'LOSE'
											? 'bg-red-500'
											: game.result === 'DRAW'
												? 'bg-yellow-500'
												: 'bg-neutral-600'}"
								></div>
								<div>
									<div class="flex items-center gap-2 mb-1">
										<span
											class="text-xs font-bold px-2 py-0.5 rounded
                                            {game.result === 'WIN'
												? 'bg-green-500/10 text-green-400'
												: game.result === 'LOSE'
													? 'bg-red-500/10 text-red-400'
													: 'bg-neutral-800 text-neutral-400'}"
										>
											{game.result}
										</span>
										<span class="text-xs text-neutral-500 font-mono">
											{new Date(game.createdAt).toLocaleDateString()}
										</span>
									</div>
									<h3 class="font-bold text-sm">vs {game.opponentName}</h3>
								</div>
							</div>

							<div class="text-right">
								<div class="text-xs text-neutral-500 uppercase tracking-wider mb-1">Map</div>
								<div class="text-sm font-mono text-neutral-300">
									<img src={`/map/${game.mapId}`} alt={game.mapId} class="w-8 h-8" />
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
