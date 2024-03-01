<script lang="ts">
	import { CopyButton, HelpText, Tooltip } from '@nais/ds-svelte-community';

	export let secretName: string;

	const workloadManifest = () => `spec:
  envFrom:
    - secret: ${secretName}`;
</script>

<h4>
	Use secret in workload
	<HelpText title="How to use this secret in a workload" placement="bottom">
		Reference the secret in your workload manifest with the snippet below.
	</HelpText>
</h4>
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

	.manifest {
		display: block;
		font-size: var(--a-font-size-small);
		word-break: break-word;
		white-space: pre-wrap;
		margin: 1rem 0.5rem;
	}
</style>
