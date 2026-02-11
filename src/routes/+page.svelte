<script lang="ts">
	import { CHARACTERS, MAPS } from '$lib/gameConfig';
	import { convex } from '$lib/convex.svelte';
	import { api } from '../../convex/_generated/api';
	import { goto } from '$app/navigation';
	import CreateGameForm from '$lib/component/landing/CreateGameForm.svelte';
	import JoinGameForm from '$lib/component/landing/JoinGameForm.svelte';

	let playerName = $state('');
	let joinCode = $state('');
	let isCreating = $state(false);
	let isJoining = $state(false);
	let error = $state('');
	let selectedMap = $state(MAPS[0]);
	let selectedCharacter = $state(CHARACTERS[0].id);

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
				playerId,
				mapId: selectedMap,
				characterId: selectedCharacter
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
				playerId,
				characterId: selectedCharacter
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
	<div class="max-w-5xl w-full bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700">
		<h1
			class="text-4xl font-black text-center mb-2 bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
		>
			Zypo
		</h1>
		<p class="text-neutral-400 text-center mb-8">Think Fast. Strike Hard.</p>

		{#if error}
			<div
				class="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center"
			>
				{error}
			</div>
		{/if}

		<CreateGameForm
			bind:playerName
			bind:selectedCharacter
			bind:selectedMap
			{isCreating}
			onCreate={handleCreate}
		>
			{#snippet joinSection()}
				<JoinGameForm bind:joinCode {isJoining} onJoin={handleJoin} />
			{/snippet}
		</CreateGameForm>
	</div>
</div>
