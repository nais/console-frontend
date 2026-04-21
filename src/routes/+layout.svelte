<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { isAuthenticated, isUnauthenticated } from '$lib/authentication';
	import { localizeLayerChart } from '$lib/chart/util';
	import '$lib/font.css';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import ProgressBar from '$lib/ui/ProgressBar.svelte';
	import { createUrqlClient } from '$lib/urql/client';
	import { setContextClient } from '$lib/urql/context';
	import { RefreshCookieQuery } from '$lib/urql/queries/userInfo';
	import { Page, Theme } from '@nais/ds-svelte-community';
	import { onMount, untrack } from 'svelte';
	import '../styles/app.css';
	import '../styles/colors.css';
	import type { LayoutProps } from './$types';
	import Login from './Login.svelte';
	import Naisdevice from './Naisdevice.svelte';
	import PageHeader from './PageHeader.svelte';

	let { data, children }: LayoutProps = $props();
	let { UserInfo, userAgent } = $derived(data);

	localizeLayerChart();

	$effect(() => {
		themeSwitch.theme = data.theme;
	});

	/**
	 * Browser-side urql client. Created once per page load, seeded with the
	 * SSR cache that `+layout.server.ts` collected via the per-request
	 * server client, so any query that ran during SSR is hydrated without
	 * a duplicate fetch. Registered into Svelte context with the official
	 * `setContextClient` so descendant components can grab it via
	 * `getContextClient()` from `@urql/svelte`.
	 *
	 * On the server we still need a client for the `RefreshCookie`
	 * keepalive call below to type-check, but the keepalive only runs
	 * inside `onMount`, i.e. browser-only.
	 */
	// `untrack` because we deliberately want the *initial* SSR payload to
	// seed the client; later updates to `data.urqlState` (which won't
	// happen anyway, since the SSR cache is only collected once) must not
	// re-create the client.
	const { client } = untrack(() =>
		createUrqlClient({
			ssrData: data.urqlState
		})
	);
	setContextClient(client);

	let user = $derived(
		UserInfo.data?.me.__typename === 'User'
			? (UserInfo.data.me as {
					readonly name: string;
					readonly isAdmin: boolean;
					readonly __typename: 'User';
				})
			: undefined
	);

	let refreshCookieInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		refreshCookieInterval = setInterval(
			async () => {
				if (user?.__typename !== 'User') return;
				await client.query(RefreshCookieQuery, {}, { requestPolicy: 'network-only' }).toPromise();
			},
			1000 * 60 * 10
		);

		return () => {
			if (refreshCookieInterval !== undefined) {
				clearInterval(refreshCookieInterval);
			}
		};
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

	const title = $derived.by(() => {
		const parts = [];
		if (page.data.meta.breadcrumbs && page.data.meta.breadcrumbs.length > 0) {
			parts.push(...page.data.meta.breadcrumbs.map((b) => b.label));
		}
		if (page.data.meta.title) {
			parts.unshift(page.data.meta.title);
		}
		return parts.join(' - ') + ' - Nais Console';
	});
</script>

<svelte:head>
	<title>
		{title}
	</title>
</svelte:head>

<Theme theme={browser ? themeSwitch.theme : data.theme}>
	<Page contentBlockPadding="none">
		<div class="full-wrapper">
			{#if loading}
				<ProgressBar />
			{/if}

			{#if !$isAuthenticated || isUnauthenticated(UserInfo.errors)}
				<!-- logged out. We check both to support both  -->
				<Login {userAgent} />
			{:else}
				{#if user?.__typename === 'User'}
					<PageHeader {user} />
				{/if}

				{@render children?.()}

				<Naisdevice />
			{/if}
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
