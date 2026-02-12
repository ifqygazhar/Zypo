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
	<title>Zypo - Bye one battle</title>
	<meta
		name="description"
		content="Zypo is a real-time multiplayer cyberpunk trivia battle game. Challenge friends, test your knowledge, and dominate the global leaderboard. Think Fast. Strike Hard."
	/>
	<meta
		name="keywords"
		content="trivia, game, multiplayer, cyberpunk, quiz, battle, coding, math, general knowledge"
	/>
	<meta name="author" content="Zypo Team" />
	<meta name="theme-color" content="#0a0a0a" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://zypo.pages.dev/" />
	<meta property="og:title" content="Zypo - Bye one battle" />
	<meta
		property="og:description"
		content="Think Fast. Strike Hard. Join the ultimate cyberpunk trivia battle arena."
	/>
	<meta property="og:image" content="https://zypo.pages.dev/og-image.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://zypo.pages.dev/" />
	<meta property="twitter:title" content="Zypo - Bye one battle" />
	<meta
		property="twitter:description"
		content="Think Fast. Strike Hard. Join the ultimate cyberpunk trivia battle arena."
	/>
	<meta property="twitter:image" content="https://zypo.pages.dev/og-image.png" />

	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster position="top-center" richColors closeButton theme="dark" />
<AudioControl />
<NetworkIndicator />
{@render children()}
