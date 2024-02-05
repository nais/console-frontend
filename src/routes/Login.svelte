<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';
	import Logo from '../Logo.svelte';
</script>

<svelte:head>
	<title>Console - Log in</title>
	<style>
		body {
			background: var(--a-bg-default);
			background: linear-gradient(
				135deg,
				var(--a-bg-default) 0%,
				var(--a-surface-alt-1-moderate) 100%
			);
		}
	</style>
</svelte:head>

<div class="wrapper">
	<div class="login">
		<h1>
			<Logo height=".8em" />
			Console
		</h1>

		<p>To access this page you need to log in with your Google account.</p>

		<Button as="a" href="/oauth2/login" variant="primary">Log in with Google</Button>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	.login {
		text-align: center;
	}
</style>
