<script lang="ts">
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { Alert, CopyButton, Loader } from '@nais/ds-svelte-community';
	import type { WorkloadManifestVariables } from './$houdini';

	export const _WorkloadManifestVariables: WorkloadManifestVariables = () => {
		return { id: workloadID };
	};

	export const manifest = graphql(`
		query WorkloadManifest($id: ID!) @load {
			node(id: $id) {
				id
				... on Workload {
					__typename
					name
					manifest {
						content
					}
				}
			}
		}
	`);

	export let workloadID: string;
</script>

<Card>
	{#if $manifest.fetching}
		<Loader />
	{/if}

	{#if $manifest.errors}
		<Alert variant="error">
			{#each $manifest.errors as error}
				{error.message}
			{/each}
		</Alert>
	{/if}

	{#if $manifest.data}
		{#if $manifest.data.node?.__typename === 'Application' || $manifest.data.node?.__typename === 'Job'}
			<h3>
				Manifest for {$manifest.data.node?.__typename.toLowerCase()}:
				{$manifest.data.node.name}
				<CopyButton
					text="Copy manifest"
					activeText="Manifest copied"
					variant="action"
					copyText={$manifest.data.node.manifest.content}
				/>
			</h3>
			<pre>{$manifest.data.node.manifest.content}</pre>
		{/if}
	{/if}
</Card>

<style>
	h3 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
