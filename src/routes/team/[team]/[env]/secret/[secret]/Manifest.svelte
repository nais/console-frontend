<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { CopyButton, Tooltip } from '@nais/ds-svelte-community';

	interface Props {
		secretName: string;
	}

	let { secretName }: Props = $props();

	const workloadManifest = () => `spec:
  envFrom:
    - secret: ${secretName}`;
</script>

<SurfaceCard title="Use this secret">
	<pre class="manifest">{workloadManifest()}</pre>
	<Tooltip content="Copy manifest to clipboard">
		<CopyButton
			text="Copy manifest"
			activeText="Manifest copied"
			variant="action"
			copyText={workloadManifest()}
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
