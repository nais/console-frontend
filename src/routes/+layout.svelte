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

	const isUnauthenticated = (errors: { message: string }[] | null) => {
		const unauthenticatedError = 'Valid user required. You are not logged in.';
		if (
			errors &&
			errors.length > 0 &&
			errors.filter((error) => error.message === unauthenticatedError).length > 0
		) {
			return true;
		}
		return false;
	};
</script>

{#if isUnauthenticated(UserInfo.errors)}
	<!-- logged out -->
	<Login />
{:else}
	{#if user?.__typename === 'User'}
		<Header {user} />
	{/if}

	<div class="container">
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
