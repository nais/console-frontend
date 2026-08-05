<script lang="ts">
	import {
		OpenSearchMajorVersion,
		type OpenSearchMemory$options,
		OpenSearchMemory,
		OpenSearchTier,
		type OpenSearchTier$options
	} from '$houdini';
	import { openSearchForm } from '$lib/forms/opensearch';
	import Form from '$lib/ui/Form/Form.svelte';
	import { openSearchPlanCosts, storageRequirements } from '$lib/utils/aivencost';
	import { Alert, BodyLong, BodyShort } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data, form }: PageProps = $props();

	const { CreateOpenSearchEnvironments } = $derived(data);

	const environments = $derived(
		($CreateOpenSearchEnvironments.data?.team.environments ?? []).filter(
			(env) => !!env.gcpProjectID
		)
	);

	const defaultTier = OpenSearchTier.SINGLE_NODE;
	const defaultMemory = OpenSearchMemory.GB_4;
</script>

<BodyLong style="margin-bottom: 1rem;">
	This will create a new OpenSearch instance for
	<span style="font-weight: bold;">{data.teamSlug}</span>.
</BodyLong>

<Form
	fields={openSearchForm}
	optionsOverrides={{
		environmentName: environments.map((env) => ({
			value: env.environment.name,
			label: env.environment.name
		}))
	}}
	defaultValues={{
		environmentName: environments.at(0)?.environment.name ?? '',
		version: OpenSearchMajorVersion.V3_3,
		tier: defaultTier,
		memory: defaultMemory,
		storageGB: storageRequirements[defaultTier][defaultMemory].min
	}}
	button="Create OpenSearch instance"
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
