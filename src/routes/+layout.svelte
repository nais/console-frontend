<script lang="ts">
	import '@nais/ds-svelte-community/css';
	import Header from './Header.svelte';
	//import '../styles/vars_dark.css';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
	import { isAuthenticated, isUnauthenticated } from '$lib/authentication';
	import '$lib/font.css';
	import ProgressBar from '$lib/ProgressBar.svelte';
	import { onMount } from 'svelte';
	import '../styles/app.css';
	import '../styles/colors.css';
	import type { LayoutData } from './$houdini';
	import Login from './Login.svelte';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { UserInfo } = $derived(data);

	let user = $derived(
		UserInfo.data?.me as
			| {
					readonly name: string;
					readonly isAdmin: boolean;
					readonly __typename: 'User';
			  }
			| undefined
	);

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

	let loading = $state(false);

	beforeNavigate(() => {
		loading = true;
	});

	afterNavigate(async () => {
		loading = false;
	});
</script>

<div
	class={[
		'full-wrapper',
		activeColor(),
		{
			['white-page']: ['/job/', '/buckets'].some((s) => $page.route.id?.includes(s))
		}
	]}
>
	{#if loading}
		<ProgressBar />
	{/if}

	{#if !$isAuthenticated || isUnauthenticated(UserInfo.errors)}
		<!-- logged out. We check both to support both  -->
		<Login />
	{:else}
		{#if user?.__typename === 'User'}
			<Header {user} />
		{/if}

		{@render children?.()}
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

	.full-wrapper.white-page {
		background: none;
	}
</style>
