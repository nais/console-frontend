<script lang="ts">
	import Header from './Header.svelte';
	import '../styles/reset.css';
	import '@navikt/ds-css/index.css';
	import '@navikt/ds-tokens/dist/tokens.css';
	import '@navikt/ds-css/chips.css';
	import '../styles/vars_light.css';
	//import '../styles/vars_dark.css';
	import '../styles/app.css';
	import '$lib/font.css';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ UserInfo } = data);
	$: user = $UserInfo.data?.user;
</script>

<Header {user} />
<div class="container">
	<slot />
</div>

<style>
	.container {
		margin: auto;
		min-width: 1000px;
		max-width: 1432px;
		min-height: 100vh;
	}
</style>
