<script lang="ts">
	interface Props {
		joinCode: string;
		isJoining: boolean;
		onJoin: () => void;
	}

	let { joinCode = $bindable(), isJoining, onJoin }: Props = $props();
</script>

<div class="grid grid-cols-3 gap-2">
	<input
		type="text"
		bind:value={joinCode}
		placeholder="CODE"
		class="col-span-2 bg-neutral-900 border border-neutral-700 rounded-lg py-3 px-4 font-mono font-bold text-center tracking-widest uppercase focus:outline-none focus:border-blue-500"
	/>
	<button
		onclick={onJoin}
		disabled={isJoining}
		class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform active:scale-95 disabled:opacity-50"
	>
		JOIN
	</button>
</div>
