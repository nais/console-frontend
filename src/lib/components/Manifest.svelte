<script lang="ts">
	import { fragment, graphql, type Manifest } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { CopyButton } from '@nais/ds-svelte-community';

	export let workload: Manifest;

	$: manifest = fragment(
		workload,
		graphql(`
			fragment Manifest on Workload {
				name
				manifest {
					content
				}
			}
		`)
	);
</script>

<Card>
	{#if manifest}
		<h3>
			Manifest for {$manifest.name}
			<CopyButton
				text="Copy manifest"
				activeText="Manifest copied"
				variant="action"
				copyText={$manifest.manifest.content}
			/>
		</h3>
		<pre>{$manifest.manifest.content}</pre>
	{/if}
</Card>

<style>
	h3 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
