<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { graphql } from '$houdini';
	import { isAuthenticated, isUnauthenticated } from '$lib/authentication';
	import { localizeLayerChart } from '$lib/chart/util';
	import '$lib/font.css';
	import ProgressBar from '$lib/ProgressBar.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { Page, Theme } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';
	import '../styles/app.css';
	import '../styles/colors.css';
	import type { LayoutProps } from './$houdini';
	import Login from './Login.svelte';
	import Naisdevice from './Naisdevice.svelte';
	import PageHeader from './PageHeader.svelte';

	let { data, children }: LayoutProps = $props();
	let { UserInfo, userAgent } = $derived(data);

	localizeLayerChart();

	themeSwitch.theme = data.theme;

	let user = $derived(
		$UserInfo.data?.me as
			| {
					readonly name: string;
					readonly isAdmin: boolean;
					readonly __typename: 'User';
			  }
			| undefined
	);

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

	beforeNavigate((navigation) => {
		if (navigation.from?.url.hostname === navigation.to?.url.hostname) {
			loading = true;
		}
	});

	afterNavigate(() => {
		loading = false;
	});
</script>

<Theme theme={themeSwitch.theme}>
	<Page contentBlockPadding="none">
		<div class="full-wrapper">
			{#if loading}
				<ProgressBar />
			{/if}

			{#if !$isAuthenticated || isUnauthenticated($UserInfo.errors)}
				<!-- logged out. We check both to support both  -->
				<Login {userAgent} />
			{:else}
				{#if user?.__typename === 'User'}
					<PageHeader {user} />
				{/if}

				{@render children?.()}
			{/if}

			<Naisdevice />
		</div>
	</Page>
</Theme>

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
		padding-bottom: 1rem;
	}
</style>
