<script lang="ts">
	interface Props {
		game: any;
		playerId: string;
	}

	let { game, playerId }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center h-screen text-center p-4">
	<h1
		class="text-6xl font-black mb-4 {game.winner === playerId ? 'text-green-500' : 'text-red-500'}"
	>
		{game.winner === playerId ? 'VICTORY' : 'DEFEAT'}
	</h1>
	<p class="text-neutral-400 text-xl mb-8">
		{game.winner === playerId ? 'Target Eliminated.' : 'System Critical failure.'}
	</p>
	<a href="/" class="bg-white text-black px-8 py-4 rounded font-bold hover:bg-neutral-200">
		RETURN TO LOBBY
	</a>
</div>
