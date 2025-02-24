<script lang="ts">
	import SearchButton from '$lib/components/search/SearchButton.svelte';
	import { docURL } from '$lib/doc';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import Logo from '../Logo.svelte';

	interface Props {
		user:
			| {
					readonly name: string;
					readonly isAdmin: boolean;
			  }
			| undefined;
	}

	let { user }: Props = $props();

	let feedbackOpen = $state(false);
</script>

<div class="header">
	<div class="header-content">
		<div class="header-left">
			<a href="/" class="logo">
				<Logo height="2rem" />
				<span class="nais-console">Nais Console</span>
			</a>
		</div>
		<div class="right">
			<SearchButton />
			<nav>
				<ul>
					<li>
						<a href="/utilization">Utilization</a>
					</li>
					<li>
						<a href={docURL()}>Docs</a>
					</li>
					{#if user?.isAdmin}
						<li><a href="/admin">Admin</a></li>
					{/if}
				</ul>
			</nav>
			<div class="cap">
				{user ? user.name : 'unauthorized'}
				- <a href="/oauth2/logout">Logout</a>
			</div>
			<Button variant="primary-neutral" size="small" onclick={() => (feedbackOpen = true)}
				>Feedback</Button
			>
			{#if feedbackOpen}
				<Feedback bind:open={feedbackOpen} />
			{/if}
		</div>
	</div>
</div>

<style>
	.right {
		display: flex;
		gap: 2rem;
		align-items: center;
	}
	.cap {
		text-transform: capitalize;
	}
	.header-left {
		display: flex;
		gap: 2rem;
	}

	.header {
		background: var(--a-surface-inverted);
		color: var(--a-text-on-inverted);
		display: flex;
		padding: 0.75rem 2rem;
		min-width: 1000px;
		position: relative;
	}
	.header-content {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin: auto;
		width: 100%;
		min-width: 1000px;
		max-width: 1432px;
		align-items: center;
	}
	.logo {
		color: var(--a-text-on-inverted);
		text-decoration: none;
		display: flex;
		gap: 1rem;
		font-size: 1.5rem;
		font-weight: bold;
	}
	nav {
		height: 100%;
	}
	ul {
		height: 100%;
		display: flex;
		align-items: stretch;
		flex-direction: row;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		list-style: none;
		align-items: stretch;
	}
	li > a {
		text-decoration: none;
		color: var(--a-text-on-inverted);
		background-color: var(--a-surface-inverted);
		display: flex;
		align-items: center;
		padding: 0 1rem;
	}
	li > a:hover {
		background-color: var(--a-surface-inverted-hover);
	}

	.cap a {
		color: var(--a-text-on-inverted);
	}
	.nais-console {
		background: linear-gradient(to left, var(--active-color-strong), #ffffff);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
