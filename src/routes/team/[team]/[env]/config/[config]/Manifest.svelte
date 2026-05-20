<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { CopyButton, ToggleGroup, ToggleGroupItem, Tooltip } from '@nais/ds-svelte-community';

	interface Props {
		configName: string;
	}

	let { configName }: Props = $props();

	let mode: string = $state('env');

	const manifest = $derived(
		mode === 'env'
			? `spec:
  envFrom:
    - configmap: ${configName}`
			: `spec:
  filesFrom:
    - configmap: ${configName}`
	);
</script>

<SurfaceCard title="Use this config">
	<ToggleGroup size="small" value={mode} onchange={(val) => (mode = val)}>
		<ToggleGroupItem value="env">Environment</ToggleGroupItem>
		<ToggleGroupItem value="files">Files</ToggleGroupItem>
	</ToggleGroup>
	<pre class="manifest">{manifest}</pre>
	<Tooltip content="Copy manifest to clipboard">
		<CopyButton
			text="Copy manifest"
			activeText="Manifest copied"
			variant="action"
			copyText={manifest}
		></CopyButton>
	</Tooltip>
</SurfaceCard>

<style>
	.manifest {
		display: block;
		font-size: var(--ax-font-size-small);
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0;
	}
</style>
