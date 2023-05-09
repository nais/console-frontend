<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Logo from '../Logo.svelte';
</script>

<div class="header">
	<div class="header-content">
		<a href="/" class="logo">
			<Logo height="2rem" />
			Console
		</a>
		<nav>
			<ul>
				<li><a href="/teams">Teams</a></li>
				<li><a href="/apps">Workloads</a></li>
				<li><a href="/deploys">Deploys</a></li>
				<li><a href="/billing">Billing</a></li>
				<li><a href="/status">Status</a></li>
				<li><a href="https://docs.nais.io">Docs</a></li>
			</ul>
		</nav>
		<div>user</div>
	</div>
</div>

<style>
	.header {
		background: var(--a-surface-inverted);
		color: var(--a-text-on-inverted);
		height: 3rem;
		display: flex;
		align-items: center;
		padding: 0 2rem;
		margin-bottom: 2rem;
		min-width: 1000px;
	}
	.header-content {
		margin: 0 auto;
		width: 100%;
		height: 100%;
		max-width: 1400px;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
	}
	.logo {
		color: var(--a-text-on-inverted);
		text-decoration: none;
		display: flex;
		align-items: center;
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
</style>
