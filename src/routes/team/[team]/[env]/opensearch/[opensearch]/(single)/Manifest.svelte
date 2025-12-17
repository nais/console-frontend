<script lang="ts">
	import { fragment, graphql, type OpenSearchManifestFragment } from '$houdini';
	import { docURL } from '$lib/doc';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { CopyButton, Heading } from '@nais/ds-svelte-community';

	interface Props {
		openSearch: OpenSearchManifestFragment;
		teamSlug: string;
	}

	let { openSearch, teamSlug }: Props = $props();

	const data = $derived(
		fragment(
			openSearch,
			graphql(`
				fragment OpenSearchManifestFragment on OpenSearch {
					name
					memory
					tier
					version {
						desiredMajor
					}
				}
			`)
		)
	);

	const niceName = $derived($data.name.replace(`opensearch-${teamSlug}-`, ''));

	const workloadManifest = $derived(`spec:
  openSearch:
    - instance: ${niceName}`);
</script>

<div class="card">
	<Heading level="2" size="medium" spacing>Use this OpenSearch</Heading>

	<Heading level="3" size="xsmall">Documentation</Heading>
	<div class="value">
		<ExternalLink href={docURL('/persistence/opensearch/how-to/use-in-workload/')}
			>How-to guide</ExternalLink
		>
	</div>

	<Heading level="3" size="xsmall">
		Manifest

		<CopyButton
			activeText="Manifest copied"
			title="Copy manifest to clipboard"
			variant="neutral"
			copyText={workloadManifest}
			size="xsmall"
		/>
	</Heading>
	<pre class="manifest">{workloadManifest}</pre>
</div>

<style>
	.value {
		margin: 0.5rem 1rem;
	}

	.manifest {
		display: block;
		font-size: var(--ax-font-size-small);
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0.5rem 1rem;
	}
</style>
