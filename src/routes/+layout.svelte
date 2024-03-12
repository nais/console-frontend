<script lang="ts">
	import '@nais/ds-svelte-community/css';
	import Header from './Header.svelte';
	//import '../styles/vars_dark.css';
	import '$lib/font.css';
	import '../styles/app.css';
	import '../styles/colors.css';
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

	let activeColor = () => {
		const now = new Date();
		// Winter
		if (now.getMonth() === 11 || now.getMonth() < 2) {
			return 'winter';
		}
		// Spring
		if (now.getMonth() > 1 && now.getMonth() < 5) {
			return 'spring';
		}
		// Summer
		if (now.getMonth() > 4 && now.getMonth() < 8) {
			return 'summer';
		}
		// Autumn
		if (now.getMonth() > 7 && now.getMonth() < 11) {
			return 'autumn';
		}
	};

	let seasons = ['winter', 'spring', 'summer', 'autumn'];
	let curr = 'winter';
	let i = 0;

	const click = () => {
		i++;
		curr = seasons[i % 4];
	};
</script>

<div class="full-wrapper {curr}">
	{#if isUnauthenticated(UserInfo.errors)}
		<!-- logged out -->
		<Login />
	{:else}
		{#if user?.__typename === 'User'}
			<Header {user} />
		{/if}

		<slot />
	{/if}
	<button on:click={click}>Click</button>
</div>

<style>
	:global(.page) {
		margin: 2rem auto 0 auto;
		min-width: 1000px;
		max-width: 1432px;
	}

	.full-wrapper {
		min-height: 100vh;
		background: var(--a-bg-default);
		background: linear-gradient(135deg, var(--a-bg-default) 0%, var(--active-color) 100%);
		padding-bottom: 1rem;
	}
</style>
