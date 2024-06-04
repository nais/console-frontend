<script lang="ts">
	import { Alert, HelpText } from '@nais/ds-svelte-community';
	import { page } from '$app/stores';
	import type { Secret$result } from '$houdini';

	export let apps: Secret$result['team']['secret']['apps'];
	export let jobs: Secret$result['team']['secret']['jobs'];

	$: team = $page.params.team;
	$: env = $page.params.env;
</script>

<h4>
	Used by
	<HelpText title="List of workloads using this secret" placement="bottom">
		All workloads that use this secret.
	</HelpText>
</h4>
{#if apps.length > 0}
	<h5>Applications</h5>
	<ul>
		{#each apps as app}
			<li><a href="/team/{team}/{env}/app/{app.name}">{app.name}</a></li>
		{/each}
	</ul>
{/if}
{#if jobs.length > 0}
	<h5>Jobs</h5>
	<ul>
		{#each jobs as job}
			<li><a href="/team/{team}/{env}/job/{job.name}">{job.name}</a></li>
		{/each}
	</ul>
{/if}
{#if apps.length === 0 && jobs.length === 0}
	<Alert size="small" variant="info">Secret is not in use by any workloads.</Alert>
{/if}

<style>
	h4 {
		display: flex;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	h5 {
		margin-top: 1rem;
		gap: 0.5rem;
	}

	ul {
		list-style: none;
		margin: 0 0 1rem 0;
		padding: 0 1rem 0 1rem;
	}
</style>
