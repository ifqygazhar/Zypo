<script lang="ts">
	import { CHARACTERS, MAPS } from '$lib/gameConfig';
	import { convex } from '$lib/convex.svelte';
	import { api } from '../../convex/_generated/api';
	import { goto } from '$app/navigation';
	import CreateGameForm from '$lib/component/landing/CreateGameForm.svelte';
	import JoinGameForm from '$lib/component/landing/JoinGameForm.svelte';
	import Leaderboard from '$lib/component/landing/Leaderboard.svelte';
	import formatError from '$lib/utils/error_format';

	let playerName = $state('');
	let playerPin = $state('');
	let joinCode = $state('');
	let isCreating = $state(false);
	let isJoining = $state(false);
	let error = $state('');
	let selectedMap = $state(MAPS[0]);
	let selectedCharacter = $state(CHARACTERS[0].id);

	async function registerUser(username: string, pin: string) {
		let country = 'UN';
		try {
			const res = await fetch('https://ipapi.co/json/');
			if (res.ok) {
				const data = await res.json();
				country = data.country_code || 'UN';
			}
		} catch (e) {
			console.warn('Failed to detect country', e);
		}

		try {
			const result = await convex.mutation(api.users.register, { username, pin, country });
			if (!result.isNew) {
				console.log(`Welcome back, agent ${username}!`);
			}
		} catch (e: any) {
			console.error('Connection failed:', e);
			const msg = formatError(e);
			if (msg.includes('WRONG_PIN')) {
				throw new Error('Invalid PIN for this username!');
			}
			throw new Error('Failed to connect to server');
		}
	}

	async function handleCreate() {
		if (!playerName.trim() || playerPin.length !== 4) {
			error = 'Enter name & 4-digit PIN';
			return;
		}
		isCreating = true;
		error = '';
		try {
			await registerUser(playerName, playerPin);
			const playerId = crypto.randomUUID();
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
			error = formatError(err);
		} finally {
			isCreating = false;
		}
	}

	async function handleJoin() {
		if (!playerName.trim() || playerPin.length !== 4 || !joinCode.trim()) {
			error = 'Enter name, PIN & Code';
			return;
		}
		isJoining = true;
		error = '';
		try {
			await registerUser(playerName, playerPin);

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
			error = formatError(err);
		} finally {
			isJoining = false;
		}
	}

	async function handleQuickMatch() {
		if (!playerName.trim() || playerPin.length !== 4) {
			error = 'Enter name & PIN first!';
			return;
		}
		isCreating = true;
		error = '';
		try {
			await registerUser(playerName, playerPin);

			const playerId = crypto.randomUUID();
			sessionStorage.setItem('zypo_playerId', playerId);
			sessionStorage.setItem('zypo_playerName', playerName);

			const result = await convex.mutation(api.games.quickMatch, {
				playerName,
				playerId,
				characterId: selectedCharacter,
				mapId: selectedMap
			});

			goto(`/game/${result.code}?pid=${playerId}`);
		} catch (e: any) {
			console.error(e);
			error = formatError(e);
			isCreating = false;
		}
	}
</script>

<div class="min-h-screen bg-neutral-950 text-white p-4 md:p-8 flex flex-col items-center">
	<div
		class="fixed top-0 left-0 w-full h-96 bg-linear-to-b from-orange-900/10 to-transparent pointer-events-none"
	></div>

	<div class="w-full max-w-7xl mb-8 flex flex-col md:flex-row justify-between items-end gap-4 z-10">
		<div class="space-y-1">
			<h1
				class="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600 transform -skew-x-12 origin-left drop-shadow-sm"
			>
				Zypo
			</h1>
			<p
				class="text-neutral-400 text-lg font-mono tracking-widest pl-2 border-l-4 border-orange-600"
			>
				THINK FAST. STRIKE HARD.
			</p>
		</div>

		{#if error}
			<div
				class="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm font-bold animate-pulse"
			>
				⚠️ {error}
			</div>
		{/if}
	</div>

	<div class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10">
		<div
			class="lg:col-span-8 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
		>
			<div
				class="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10 group-hover:bg-orange-500/10 transition-all duration-700"
			></div>

			<CreateGameForm
				bind:playerName
				bind:playerPin
				bind:selectedCharacter
				bind:selectedMap
				{isCreating}
				onCreate={handleCreate}
				onQuickMatch={handleQuickMatch}
			>
				{#snippet joinSection()}
					<JoinGameForm bind:joinCode {isJoining} onJoin={handleJoin} />
				{/snippet}
			</CreateGameForm>
		</div>

		<div class="lg:col-span-4 h-full">
			<Leaderboard />
		</div>
	</div>
</div>
