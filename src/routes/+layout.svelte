<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { isAuthenticated, isUnauthenticated } from '$lib/authentication';
	import { localizeLayerChart } from '$lib/chart/util';
	import '$lib/font.css';
	import { chatPanel } from '$lib/stores/chatPanel.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import ChatPanel from '$lib/ui/ChatPanel.svelte';
	import ProgressBar from '$lib/ui/ProgressBar.svelte';
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

	$effect(() => {
		themeSwitch.theme = data.theme;
	});

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

	let refreshCookieInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		refreshCookieInterval = setInterval(
			async () => {
				if (user?.__typename !== 'User') return;
				refreshCookie.fetch({ policy: 'NoCache' });
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

	let isLoggedIn = $derived($isAuthenticated && !isUnauthenticated($UserInfo.errors));
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

			{#if !isLoggedIn}
				<Login {userAgent} />
			{:else}
				<div
					class="app-layout"
					class:chat-open={chatPanel.isOpen}
					style:--chat-panel-width="{chatPanel.width}px"
				>
					<div class="main-content">
						{#if user?.__typename === 'User'}
							<PageHeader {user} />
						{/if}

						{@render children?.()}

						<Naisdevice />
					</div>

					<ChatPanel />
				</div>
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

	.app-layout {
		display: block;
	}

	.main-content {
		transition: margin-right 0.2s ease;
	}

	/* Desktop: push content aside when chat is open */
	@media (min-width: 769px) {
		.app-layout.chat-open .main-content {
			margin-right: var(--chat-panel-width);
		}
	}
</style>
