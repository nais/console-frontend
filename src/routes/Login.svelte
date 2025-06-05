<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, Button, CopyButton, Heading, TextField } from '@nais/ds-svelte-community';
	import Logo from '../Logo.svelte';
	import { isNaisdevice } from './Naisdevice.svelte';

	const redirectPath = (url: URL) => {
		return encodeURIComponent(url.pathname + url.search + url.hash);
	};

	let { userAgent }: { userAgent: string } = $props();

	let chrome: boolean = $derived(userAgent.indexOf('Chrome/') > 0);
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

		<p>To access this page you need to log in with your Google Workspace account.</p>

		<Button as="a" href="/oauth2/login?redirect_uri={redirectPath($page.url)}" variant="primary">
			Log in to Nais Console
		</Button>

		{#if isNaisdevice() && chrome}
			<p class="help">
				If you tried to open a page before logging into naisdevice, Chrome will not notice it until
				you have deleted the open sockets. You can do this by navigating to:
			</p>
			<div class="line">
				<TextField
					label="Chrome net-internals url"
					hideLabel={true}
					type="text"
					readonly
					value="chrome://net-internals#sockets"
				/>
				<CopyButton copyText="chrome://net-internals#sockets" />
			</div>
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
		max-width: 600px;
	}

	.help {
		color: var(--ax-text-neutral-subtle);
		margin-top: var(--ax-space-64);
		text-align: left;
	}

	.line {
		display: flex;
		gap: 1rem;
		align-items: center;

		:global(> *:first-child) {
			flex-grow: 1;
		}
	}
</style>
