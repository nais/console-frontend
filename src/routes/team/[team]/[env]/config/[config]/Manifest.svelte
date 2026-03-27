<script lang="ts">
	import {
		CopyButton,
		Heading,
		ToggleGroup,
		ToggleGroupItem,
		Tooltip
	} from '@nais/ds-svelte-community';

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

<div>
	<Heading as="h2" size="medium" spacing>Use this config</Heading>

	<Heading as="h3" size="xsmall">Manifest</Heading>
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
</div>

<style>
	.manifest {
		display: block;
		font-size: var(--ax-font-size-small);
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0.5rem 1rem;
	}
</style>
