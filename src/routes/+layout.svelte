<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	import { setupConvex } from 'convex-svelte';
	import AudioControl from '$lib/component/common/AudioControl.svelte';
	import NetworkIndicator from '$lib/component/common/NetworkIndicator.svelte';

	import { Toaster } from 'svelte-sonner';

	let { children } = $props();

	setupConvex(PUBLIC_CONVEX_URL);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster position="top-center" richColors closeButton theme="dark" />
<AudioControl />
<NetworkIndicator />
{@render children()}
