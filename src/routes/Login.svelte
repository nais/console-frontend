<script lang="ts">
	import { page } from '$app/state';
	import { Alert, Button, CopyButton, Heading, TextField } from '#lib/shadcn/ui/index.js';
	import { CheckmarkCircleIcon } from '#lib/icons/index.js';
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
			background: var(--card);
			background: linear-gradient(135deg, var(--card) 0%, var(--active-color) 100%);
		}
	</style>
</svelte:head>

<div class="wrapper">
	<div class="login">
		{#if isNaisdevice()}
			<div class="naisdevice-banner">
				<CheckmarkCircleIcon />
				<span>Naisdevice successfully connected.</span>
			</div>
		{/if}

		<Heading as="h1" size="large" spacing>
			<Logo height=".8em" />
			Nais Console
		</Heading>
		{#if page.url.searchParams?.get('error')}
			{const error = $derived(page.url.searchParams.get('error'))}
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

		<Button as="a" href="/oauth2/login?redirect_uri={redirectPath(page.url)}" variant="primary">
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
		height: calc(100vh - var(--nais-space-16));
	}

	.login {
		text-align: center;
		max-width: 800px;
	}

	.naisdevice-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--nais-space-12);
		padding: var(--nais-space-20) var(--nais-space-32);
		background: var(--success-muted);
		color: var(--success);
		border-radius: var(--nais-radius-8);
		margin-bottom: var(--nais-space-32);
		font-size: var(--sh-font-size-xl);
		font-weight: 700;
		box-shadow: none;
	}

	.naisdevice-banner :global(svg) {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
	}

	.naisdevice-banner span {
		flex: 1;
	}

	.help {
		color: var(--muted-foreground);
		margin-top: var(--nais-space-64);
		text-align: left;
	}

	.line {
		display: flex;
		align-items: center;
		gap: var(--nais-space-8);

		:global(> *:first-child) {
			flex-grow: 1;
		}
	}

	.note {
		margin-top: var(--nais-space-8);
		margin-bottom: 0;
		font-size: var(--sh-font-size-base);
		color: var(--muted-foreground);
		text-align: left;
	}
</style>
