<script lang="ts">
	import {
		OpenSearchMemory,
		type OpenSearchMemory$options,
		OpenSearchTier,
		type OpenSearchTier$options
	} from '$houdini';
	import { docURL } from '$lib/doc';
	import { openSearchForm } from '$lib/forms/opensearch';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import Form from '$lib/ui/Form/Form.svelte';
	import { openSearchPlanCosts } from '$lib/utils/aivencost';
	import { Alert, BodyShort } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();

	const { UpdateOpenSearchData } = $derived(data);
	const openSearch = $derived($UpdateOpenSearchData.data?.team.environment.openSearch);
</script>

<Alert variant="info" size="small">
	<BodyShort size="small">
		Changing these settings may cause a restart of this OpenSearch instance.
	</BodyShort>
	<BodyShort size="small">
		If you're upgrading major versions, consult the
		<ExternalLink href={docURL('/persistence/opensearch/how-to/upgrade-major-version')}>
			migration guide
		</ExternalLink>
		first.
	</BodyShort>
</Alert>

<Form
	mode="edit"
	fields={openSearchForm}
	defaultValues={{
		version: openSearch?.version.desiredMajor ?? '',
		tier: openSearch?.tier ?? OpenSearchTier.SINGLE_NODE,
		memory: openSearch?.memory ?? OpenSearchMemory.GB_4,
		storageGB: openSearch?.storageGB ?? ''
	}}
	after={{
		storageGB: reducingStorage
	}}
	button="Save changes"
	{form}
>
	{#snippet children(values)}
		{@const tier = values.tier as OpenSearchTier$options}
		{@const memory = values.memory as OpenSearchMemory$options}
		{#if Number.isFinite(openSearchPlanCosts[tier]?.[memory])}
			<BodyShort>
				Estimated cost: <strong
					>{openSearchPlanCosts[tier][memory].toLocaleString('no-NO', {
						style: 'currency',
						currency: 'EUR'
					})}</strong
				> per month
			</BodyShort>
			{#if tier === OpenSearchTier.SINGLE_NODE && memory === OpenSearchMemory.GB_2}
				<Alert variant="warning" size="small">
					This combination of tier and memory is not recommended for production workloads.<br />
					Limitations include no guarantees for uptime and availability, no detailed metrics, and limited
					backups.
				</Alert>
			{/if}
		{/if}
	{/snippet}
</Form>

{#snippet reducingStorage()}
	<BodyShort size="small">Reducing storage will cause the service to re-balance.</BodyShort>
{/snippet}
