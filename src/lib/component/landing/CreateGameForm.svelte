<script lang="ts">
	import type { Snippet } from 'svelte';
	import IdentityForm from './create-game/IdentityForm.svelte';
	import AgentSelector from './create-game/AgentSelector.svelte';
	import MissionIntel from './create-game/MissionIntel.svelte';
	import MapSelector from './create-game/MapSelector.svelte';

	interface Props {
		playerName: string;
		playerPin: string;
		selectedCharacter: string;
		selectedMap: string;
		isCreating: boolean;
		customQuestions: any;
		onCreate: () => void;
		onQuickMatch: () => void;
		joinSection: Snippet;
	}

	let {
		playerName = $bindable(),
		playerPin = $bindable(),
		selectedCharacter = $bindable(),
		selectedMap = $bindable(),
		customQuestions = $bindable(),
		isCreating,
		onCreate,
		onQuickMatch,
		joinSection
	}: Props = $props();

	let isUploading = $state(false);
	let customAvatar = $state<string | null>(null);
</script>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-full">
	<!-- Left Column: Identity & Actions -->
	<IdentityForm
		bind:playerName
		bind:playerPin
		{isCreating}
		{isUploading}
		{onCreate}
		{onQuickMatch}
		{joinSection}
	/>

	<!-- Right Column: Loadout Selection -->
	<AgentSelector bind:selectedCharacter bind:isUploading bind:customAvatar {playerName}>
		<!-- Nested Slots for Agent Selector -->
		<MissionIntel bind:customQuestions />
		<MapSelector bind:selectedMap />
	</AgentSelector>
</div>
