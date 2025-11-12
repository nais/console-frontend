<script lang="ts">
	import { fragment, graphql, type Manifest } from '$houdini';
	import { CopyButton } from '@nais/ds-svelte-community';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import { yaml } from 'svelte-highlight/languages';
	import '../../../styles/aksel-highlight.css';

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

{#if $manifest}
	<div class="copy-button">
		<CopyButton
			text="Copy manifest"
			activeText="Manifest copied"
			variant="action"
			copyText={$manifest.manifest.content}
			size="xsmall"
		/>
	</div>
	<div>
		<Highlight language={yaml} code={$manifest.manifest.content} let:highlighted>
			<LineNumbers {highlighted} hideBorder wrapLines />
		</Highlight>
	</div>
{/if}

<style>
	.copy-button {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--ax-space-12);
	}
</style>
