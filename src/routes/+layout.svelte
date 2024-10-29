<script lang="ts">
	import '@nais/ds-svelte-community/css';
	import Header from './Header.svelte';
	//import '../styles/vars_dark.css';
	import { graphql } from '$houdini';
	import { isAuthenticated, isUnauthenticated } from '$lib/authentication';
	import '$lib/font.css';
	import { onMount } from 'svelte';
	import '../styles/app.css';
	import '../styles/colors.css';
	import type { LayoutData } from './$houdini';
	import Login from './Login.svelte';

	export let data: LayoutData;
	$: ({ UserInfo } = data);

	$: user = UserInfo.data?.me as
		| {
				readonly name: string;
				readonly isAdmin: boolean;
				readonly __typename: 'User';
		  }
		| undefined;

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

	const refreshCookie = graphql(`
		query RefreshCookie {
			me {
				__typename
			}
		}
	`);

	onMount(() => {
		setInterval(
			async () => {
				if (user?.__typename !== 'User') return;
				refreshCookie.fetch({ policy: 'NoCache' });
			},
			1000 * 60 * 10
		);
	});
</script>

<div class="full-wrapper {activeColor()}">
	{#if !$isAuthenticated || isUnauthenticated(UserInfo.errors)}
		<!-- logged out. We check both to support both  -->
		<Login />
	{:else}
		{#if user?.__typename === 'User'}
			<Header {user} />
		{/if}

		<slot />
	{/if}
</div>

<style>
	:global(.page) {
		margin: 0 auto 0 auto;
		min-width: 1000px;
		max-width: 1432px;
	}
	@media (max-width: 1464px) {
		:global(.page) {
			padding: 0 2rem;
		}
	}

	.full-wrapper {
		min-height: 100vh;
		background: var(--a-bg-default);
		background: linear-gradient(135deg, var(--a-bg-default) 0%, var(--active-color) 100%);
		padding-bottom: 1rem;
	}
</style>
