<script lang="ts">
	import { fragment, graphql, type OpenSearchManifestFragment } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { docURL } from '$lib/doc';
	import { Alert, BodyLong, Button, CopyButton, Heading, Modal } from '@nais/ds-svelte-community';

	interface Props {
		openSearch: OpenSearchManifestFragment;
		teamSlug: string;
	}

	let { openSearch, teamSlug }: Props = $props();

	const data = fragment(
		openSearch,
		graphql(`
			fragment OpenSearchManifestFragment on OpenSearch {
				name
				size
				tier
				majorVersion
			}
		`)
	);

	const niceName = $derived($data.name.replace(`opensearch-${teamSlug}-`, ''));

	const workloadManifest = $derived(`spec:
  openSearch:
    - instance: ${niceName}`);

	const tomlManifest = $derived(`[openSearch.${niceName}]
instance = "${niceName}"
size = "${$data.size}"
tier = "${$data.tier}"
${$data.majorVersion ? `version = "${$data.majorVersion}"` : ``}
	`);

	let modalOpen = $state(false);
</script>

<div class="card">
	<Heading level="2" size="medium" spacing>Use this OpenSearch</Heading>

	<Heading level="3" size="xsmall">Documentation</Heading>
	<div class="value">
		<ExternalLink href={docURL('/persistence/opensearch/how-to/create-application/')}
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
	<Button variant="tertiary-neutral" size="small" onclick={() => (modalOpen = true)}>
		Show in Nais TOML format
	</Button>
</div>

<Modal bind:open={modalOpen} header="Nais TOML">
	<BodyLong>
		The manifest below can be added to your <code>nais.toml</code> file. You can then use
		<code>nais alpha apply</code> to manage the lifecycle of your OpenSearch.
	</BodyLong>
	{#if $data.name != niceName}
		<Alert variant="warning" size="small" inline style="margin: 1rem 0">
			You will need to do a manual change to the resource using <code>kubectl</code> to allow Console
			to manage this resource.
		</Alert>
	{/if}
	<CopyButton
		activeText="Manifest copied"
		text="Copy manifest to clipboard"
		variant="neutral"
		copyText={tomlManifest}
		size="xsmall"
	/>
	<pre class="manifest">{tomlManifest}</pre>
</Modal>

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
