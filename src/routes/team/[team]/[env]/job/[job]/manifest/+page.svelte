<script lang="ts">
	import Card from '$lib/Card.svelte';

	import { page } from '$app/stores';
	import { Alert, CopyButton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	let name = $page.params.job;
	$: ({ JobManifest } = data);
</script>

{#if $JobManifest.errors}
	<Alert variant="error">
		{#each $JobManifest.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $JobManifest.data}
	{@const job = $JobManifest.data.team.environment.job}
	<Card>
		<h4>
			Manifest for job {name}
			<CopyButton
				text="Copy manifest"
				activeText="Manifest copied"
				variant="action"
				copyText={job.manifest.content}
			/>
		</h4>

		<pre>{job.manifest.content}</pre>
	</Card>
{/if}

<style>
	h4 {
		display: flex;
		justify-content: space-between;
	}
</style>
