<script lang="ts">
	import { fragment, graphql, type ValkeyManifestFragment } from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { CopyButton, Heading } from '@nais/ds-svelte-community';

	interface Props {
		valkey: ValkeyManifestFragment;
		teamSlug: string;
	}

	let { valkey, teamSlug }: Props = $props();

	const data = $derived(
		fragment(
			valkey,
			graphql(`
				fragment ValkeyManifestFragment on Valkey {
					name
					memory
					tier
					maxMemoryPolicy
				}
			`)
		)
	);

	const niceName = $derived($data.name.replace(`valkey-${teamSlug}-`, ''));

	const workloadManifest = $derived(`spec:
  valkey:
    - instance: ${niceName}`);
</script>

<SurfaceCard title="Use this Valkey">
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
