<script lang="ts">
	import { convex } from '$lib/convex.svelte';
	import { api } from '../../convex/_generated/api';
	import { goto } from '$app/navigation';

	let playerName = $state('');
	let joinCode = $state('');
	let isCreating = $state(false);
	let isJoining = $state(false);
	let error = $state('');

	async function handleCreate() {
		if (!playerName.trim()) {
			error = 'Please enter your name';
			return;
		}
		isCreating = true;
		error = '';
		try {
			// Generate a random ID for this session/player
			const playerId = crypto.randomUUID();
			// Store specific player ID in sessionStorage to support multi-tab testing
			sessionStorage.setItem('zypo_playerId', playerId);
			sessionStorage.setItem('zypo_playerName', playerName);

			const result = await convex.mutation(api.games.createGame, {
				playerName,
				playerId
			});
			goto(`/game/${result.code}?pid=${playerId}`);
		} catch (err: any) {
			error = 'Failed to create game: ' + err.message;
		} finally {
			isCreating = false;
		}
	}

	async function handleJoin() {
		if (!playerName.trim() || !joinCode.trim()) {
			error = 'Enter name and game code';
			return;
		}
		isJoining = true;
		error = '';
		try {
			const playerId = crypto.randomUUID();
			sessionStorage.setItem('zypo_playerId', playerId);
			sessionStorage.setItem('zypo_playerName', playerName);

			await convex.mutation(api.games.joinGame, {
				code: joinCode.toUpperCase(),
				playerName,
				playerId
			});
			goto(`/game/${joinCode.toUpperCase()}?pid=${playerId}`);
		} catch (err: any) {
			error = err.message;
		} finally {
			isJoining = false;
		}
	}
</script>

<div class="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
	<div class="max-w-md w-full bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700">
		<h1
			class="text-4xl font-black text-center mb-2 bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
		>
			BRAIN DUEL
		</h1>
		<p class="text-neutral-400 text-center mb-8">Speed Math & Trivia Battles</p>

		{#if error}
			<div
				class="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center"
			>
				{error}
			</div>
		{/if}

		<div class="space-y-4">
			<div>
				<label for="name" class="block text-xs font-bold uppercase text-neutral-500 mb-1"
					>Your Name</label
				>
				<input
					id="name"
					type="text"
					bind:value={playerName}
					placeholder="Enter nickname..."
					class="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-3 px-4 font-bold focus:outline-none focus:border-orange-500 transition-colors"
				/>
			</div>

			<div class="relative py-2">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-neutral-700"></div>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-neutral-800 px-2 text-neutral-500">Start Playing</span>
				</div>
			</div>

			<button
				onclick={handleCreate}
				disabled={isCreating}
				class="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isCreating ? 'CREATING...' : 'CREATE NEW GAME'}
			</button>

			<div class="grid grid-cols-3 gap-2 mt-4">
				<input
					type="text"
					bind:value={joinCode}
					placeholder="CODE"
					class="col-span-2 bg-neutral-900 border border-neutral-700 rounded-lg py-3 px-4 font-mono font-bold text-center tracking-widest uppercase focus:outline-none focus:border-blue-500"
				/>
				<button
					onclick={handleJoin}
					disabled={isJoining}
					class="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform active:scale-95 disabled:opacity-50"
				>
					JOIN
				</button>
			</div>
		</div>
	</div>
</div>
