<script lang="ts">
	import '@navikt/ds-css/chips.css';
	import '@navikt/ds-css/index.css';
	import '@navikt/ds-tokens/dist/tokens.css';
	import '../styles/reset.css';
	import '../styles/vars_light.css';
	import Header from './Header.svelte';
	//import '../styles/vars_dark.css';
	import { page } from '$app/stores';
	import '$lib/font.css';
	import { Alert } from '@nais/ds-svelte-community';
	import '../styles/app.css';
	import type { PageData } from './$houdini';
	import Login from './Login.svelte';

	export let data: PageData;
	$: ({ UserInfo } = data);

	$: user = UserInfo.data?.me as
		| {
				readonly name: string;
				readonly isAdmin: boolean;
				readonly __typename: 'User';
		  }
		| undefined;
</script>

{#if user == undefined}
	<!-- logged out -->
	<Login />
{:else}
	{#if user?.__typename === 'User'}
		<Header {user} />
	{/if}

	<div class="container">
		{#if $page.url.searchParams?.get('error') == 'unknown-user'}
			<Alert variant="error">Error during login. The user is not known in the system.</Alert>
		{/if}

		<slot />
	</div>
{/if}

<style>
	.container {
		margin: auto;
		min-width: 1000px;
		max-width: 1432px;
	}
</style>
