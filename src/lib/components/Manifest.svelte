<script lang="ts">
	import { fragment, graphql, type Manifest } from '$houdini';
	import { CopyButton } from '@nais/ds-svelte-community';
	import { FileTextIcon } from '@nais/ds-svelte-community/icons';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import { yaml } from 'svelte-highlight/languages';
	import 'svelte-highlight/styles/github.css';
	import IconWithText from './IconWithText.svelte';

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

{#if manifest}
	<div class="header">
		<IconWithText icon={FileTextIcon} text="Manifest for {$manifest.name}" size="large" />

		<CopyButton
			text="Copy manifest"
			activeText="Manifest copied"
			variant="action"
			copyText={$manifest.manifest.content}
			size="xsmall"
		/>
	</div>

	<Highlight language={yaml} code={$manifest.manifest.content} let:highlighted>
		<LineNumbers {highlighted} hideBorder />
	</Highlight>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
</style>
