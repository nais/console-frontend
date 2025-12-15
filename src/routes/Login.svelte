<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, Button, CopyButton, Heading, TextField } from '@nais/ds-svelte-community';
	import Logo from '../Logo.svelte';
	import { isNaisdevice } from './Naisdevice.svelte';

	const redirectPath = (url: URL) => {
		return encodeURIComponent(url.pathname + url.search + url.hash);
	};

	let { userAgent }: { userAgent: string } = $props();

	let chromiumBasedOnMac: boolean = $derived(
		userAgent.indexOf('Chrome/') > 0 && userAgent.indexOf('Mac') > -1
	);
</script>

<svelte:head>
	<title>Log in - Nais Console</title>
	<style>
		body {
			background: var(--ax-bg-default);
			background: linear-gradient(135deg, var(--ax-bg-default) 0%, var(--active-color) 100%);
		}
	</style>
</svelte:head>

<div class="wrapper">
	<div class="login">
		{#if isNaisdevice()}
			<div class="naisdevice-banner">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="icon"
				>
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
				<span>Naisdevice successfully connected.</span>
			</div>
		{/if}

		<Heading level="1" size="large" spacing>
			<Logo height=".8em" />
			Nais Console
		</Heading>
		{#if $page.url.searchParams?.get('error')}
			{@const error = $page.url.searchParams.get('error')}
			<Alert variant="error">
				{#if error == 'unknown-user'}
					Error during login: Unknown user.<br />
					Please contact the system administrator.
				{:else}
					<!-- "unable-to-create-session", "invalid-state", and "unauthenticated" are known. -->
					Error during login, please try again.
				{/if}
			</Alert>
		{/if}

		<p>Welcome to Nais Console. Please log in with your Google Workspace account to continue.</p>

		<Button as="a" href="/oauth2/login?redirect_uri={redirectPath($page.url)}" variant="primary">
			Log in to Nais Console
		</Button>

		{#if isNaisdevice() && chromiumBasedOnMac}
			<p class="help">
				If anything Chrome-related tried to open a page before logging into naisdevice, your browser
				will not notice that naisdevice is now connected until you have deleted the open sockets.
				You can do this by navigating to:
			</p>
			<div class="line">
				<TextField
					label="Chromium net-internals url"
					hideLabel={true}
					type="text"
					readonly
					value="chrome://net-internals#sockets"
				/>
				<CopyButton
					variant="action"
					text="Copy URL"
					activeText="URL copied"
					copyText="chrome://net-internals#sockets"
				/>
			</div>
			<p class="note">This works in Brave, Edge, and other Chromium-based browsers too.</p>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		height: calc(100vh - 1rem);
	}

	.login {
		text-align: center;
		max-width: 800px;
	}

	.naisdevice-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-20) var(--ax-space-32);
		background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
		color: var(--ax-text-success-subtle);
		border-radius: var(--ax-border-radius-medium);
		margin-bottom: var(--ax-space-32);
		font-size: var(--ax-font-size-xlarge);
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(40, 167, 69, 0.25);
	}

	.naisdevice-banner .icon {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
	}

	.naisdevice-banner span {
		flex: 1;
	}

	.help {
		color: var(--ax-text-neutral-subtle);
		margin-top: var(--ax-space-64);
		text-align: left;
	}

	.line {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);

		:global(> *:first-child) {
			flex-grow: 1;
		}
	}

	.note {
		margin-top: var(--ax-space-8);
		margin-bottom: 0;
		font-size: var(--ax-font-size-14);
		color: var(--ax-text-neutral-subtle);
		text-align: left;
	}
</style>
