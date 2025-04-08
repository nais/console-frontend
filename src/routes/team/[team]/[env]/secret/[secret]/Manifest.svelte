<script lang="ts">
	import { docURL } from '$lib/doc';
	import { CopyButton, Heading, Tooltip } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		secretName: string;
	}

	let { secretName }: Props = $props();

	const workloadManifest = () => `spec:
  envFrom:
    - secret: ${secretName}`;
</script>

<div class="card">
	<Heading level="2" size="medium" spacing>Use This Secret</Heading>

	<Heading level="3" size="xsmall">Documentation</Heading>
	<div class="value">
		<a href={docURL('/services/secrets/how-to/workload/')} target="_blank"
			>How-to guide
			<ExternalLinkIcon title="How-to guide" font-size="1.5rem" />
		</a>
	</div>

	<Heading level="3" size="xsmall">Manifest</Heading>
	<pre class="manifest">{workloadManifest()}</pre>
	<Tooltip content="Copy manifest to clipboard">
		<CopyButton
			text="Copy manifest"
			activeText="Manifest copied"
			variant="action"
			copyText={workloadManifest()}
		></CopyButton>
	</Tooltip>
</div>

<style>
	.card {
		background-color: var(--ax-bg-sunken, --a-surface-subtle);
		padding: var(--ax-space-20, --a-spacing-5) var(--ax-space-20, --a-spacing-5);
		border-radius: 12px;
	}
	.value {
		margin: 0.5rem 1rem;
	}

	.manifest {
		display: block;
		font-size: var(--ax-font-size-small, --a-font-size-small);
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0.5rem 1rem;
	}
</style>
