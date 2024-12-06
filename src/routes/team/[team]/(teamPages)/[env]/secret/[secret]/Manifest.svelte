<script lang="ts">
	import { docURL } from '$lib/doc';
	import { CopyButton, Tooltip } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		secretName: string;
	}

	let { secretName }: Props = $props();

	const workloadManifest = () => `spec:
  envFrom:
    - secret: ${secretName}`;
</script>

<h4>Use this secret</h4>

<h5>Documentation</h5>
<div class="value">
	<a href={docURL('/services/secrets/how-to/workload/')} target="_blank"
		>How-to guide
		<ExternalLinkIcon title="How-to guide" font-size="1.5rem" />
	</a>
</div>

<h5>Manifest</h5>
<pre class="manifest">{workloadManifest()}</pre>
<Tooltip content="Copy manifest to clipboard">
	<CopyButton
		text="Copy manifest"
		activeText="Manifest copied"
		variant="action"
		copyText={workloadManifest()}
	></CopyButton>
</Tooltip>

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

	.value {
		margin: 0.5rem 1rem;
	}

	.manifest {
		display: block;
		font-size: var(--a-font-size-small);
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0.5rem 1rem;
	}
</style>
