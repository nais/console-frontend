<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, Button } from '@nais/ds-svelte-community';
	import Logo from '../Logo.svelte';

	const redirectPath = (url: URL) => {
		return encodeURIComponent(url.pathname + url.search + url.hash);
	};
</script>

<svelte:head>
	<title>Console - Log in</title>
	<style>
		body {
			background: var(--a-bg-default);
			background: linear-gradient(135deg, var(--a-bg-default) 0%, var(--active-color) 100%);
		}
	</style>
</svelte:head>

<div class="wrapper">
	<div class="login">
		<h1>
			<Logo height=".8em" />
			Console
		</h1>

		{#if $page.url.searchParams?.get('error')}
			{@const error = $page.url.searchParams.get('error')}
			<Alert variant="error">
				{#if error == 'unknown-user'}
					Error during login. The user is not known in the system.<br />
					Please contact the system administrator.
				{:else}
					<!-- "unable-to-create-session", "invalid-state", and "unauthenticated" are known. -->
					Error during login, please try again.
				{/if}
			</Alert>
		{/if}

		<p>To access this page you need to log in with your Google Workspace account.</p>

		<Button as="a" href="/oauth2/login?redirect_uri={redirectPath($page.url)}" variant="primary"
			>Log in to NAIS Console</Button
		>
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
	}
</style>
