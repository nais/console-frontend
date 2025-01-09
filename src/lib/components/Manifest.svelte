<script lang="ts">
	import { fragment, graphql, type Manifest } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { CopyButton } from '@nais/ds-svelte-community';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import { yaml } from 'svelte-highlight/languages';
	import 'svelte-highlight/styles/github.css';

	interface Props {
		workload: Manifest;
	}

	let { workload }: Props = $props();

	let manifest = $derived(
		fragment(
			workload,
			graphql(`
				fragment Manifest on Workload {
					name
					manifest {
						content
					}
				}
			`)
		)
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
		<Highlight language={yaml} code={$manifest.manifest.content} let:highlighted>
			<LineNumbers {highlighted} hideBorder />
		</Highlight>
	{/if}
</Card>

<style>
	h3 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
