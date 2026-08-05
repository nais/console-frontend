<script lang="ts">
	import { ValkeyMaxMemoryPolicy, ValkeyMemory, ValkeyTier } from '$houdini';
	import { valkeyForm, valkeyGroups } from '$lib/forms/valkey';
	import Form from '$lib/ui/Form/Form.svelte';
	import { valkeyPlanCosts } from '$lib/utils/aivencost';
	import { Alert, BodyLong, BodyShort } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data, form }: PageProps = $props();

	const { CreateValkeyEnvironments } = $derived(data);

	const environments = $derived(
		($CreateValkeyEnvironments.data?.team.environments ?? []).filter((env) => !!env.gcpProjectID)
	);
</script>

<BodyLong style="margin-bottom: 1rem;">
	This will create a new Valkey instance for
	<span style="font-weight: bold;">{data.teamSlug}</span>.
</BodyLong>

<Form
	fields={valkeyForm}
	groups={valkeyGroups}
	optionsOverrides={{
		environmentName: environments.map((env) => ({
			value: env.environment.name,
			label: env.environment.name
		}))
	}}
	defaultValues={{
		databases: 16,
		memory: ValkeyMemory.GB_1,
		tier: ValkeyTier.HIGH_AVAILABILITY,
		maxMemoryPolicy: ValkeyMaxMemoryPolicy.NO_EVICTION,
		environmentName: environments.at(0)?.environment.name ?? ''
	}}
	{form}
>
	{#snippet children(values)}
		{@const tier = values.tier as keyof typeof valkeyPlanCosts}
		{@const memory = values.memory as keyof (typeof valkeyPlanCosts)[typeof tier]}
		{#if tier && memory && valkeyPlanCosts[tier]?.[memory] !== undefined}
			<BodyShort>
				Estimated cost: <strong
					>{valkeyPlanCosts[tier][memory].toLocaleString('no-NO', {
						style: 'currency',
						currency: 'EUR'
					})}</strong
				> per month
			</BodyShort>
			{#if tier === ValkeyTier.SINGLE_NODE && memory === ValkeyMemory.GB_1}
				<Alert variant="warning" size="small" style="margin-bottom: 1rem;">
					This combination of tier and memory is not recommended for production workloads.<br />
					Limitations include no guarantees for uptime and availability, no detailed metrics, and limited
					backups.
				</Alert>
			{/if}
		{/if}
	{/snippet}
</Form>
