<script lang="ts">
	import '@navikt/ds-css/chips.css';
	import '@navikt/ds-css/index.css';
	import '@navikt/ds-tokens/dist/tokens.css';
	import '../styles/reset.css';
	import '../styles/vars_light.css';
	import Header from './Header.svelte';
	//import '../styles/vars_dark.css';
	import '$lib/font.css';
	import '../styles/app.css';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ UserInfo } = data);

	$: user = $UserInfo.data?.me as
		| {
				readonly name: string;
				readonly __typename: 'User';
		  }
		| undefined;
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
	}
</style>
