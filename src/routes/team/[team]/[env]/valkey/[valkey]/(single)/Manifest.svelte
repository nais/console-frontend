<script lang="ts">
	import { docURL } from '$lib/doc';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { useFragment, type FragmentType } from '$lib/urql/fragment';
	import { CopyButton, Heading } from '@nais/ds-svelte-community';
	import { ValkeyManifestFragment } from './manifest';

	interface Props {
		valkey: FragmentType<typeof ValkeyManifestFragment>;
		teamSlug: string;
	}

	let { valkey, teamSlug }: Props = $props();

	const data = $derived(useFragment(ValkeyManifestFragment, valkey));

	const niceName = $derived(data.name.replace(`valkey-${teamSlug}-`, ''));

	const workloadManifest = $derived(`spec:
  valkey:
    - instance: ${niceName}`);
</script>

<div>
	<Heading as="h2" size="medium" spacing>Use this Valkey</Heading>

	<Heading as="h3" size="xsmall">Documentation</Heading>
	<div class="value">
		<ExternalLink href={docURL('/persistence/valkey/how-to/use-in-workload/')}
			>How-to guide</ExternalLink
		>
	</div>

	<Heading as="h3" size="xsmall">
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
