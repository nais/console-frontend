<script lang="ts">
	import { ValkeyMaxMemoryPolicy, ValkeyMemory, ValkeyTier } from '$houdini';
	import { valkeyForm, valkeyGroups } from '$lib/forms/valkey';
	import Form from '$lib/ui/Form/Form.svelte';
	import { valkeyPlanCosts } from '$lib/utils/aivencost';
	import { Alert, BodyShort } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();

	const { UpdateValkeyData } = $derived(data);
	const valkey = $derived($UpdateValkeyData.data?.team.environment.valkey);
</script>

<Alert variant="info" size="small">
	Changing these settings may cause a restart of this Valkey instance.
</Alert>

<Form
	mode="edit"
	fields={valkeyForm}
	groups={valkeyGroups}
	defaultValues={{
		notifyKeyspaceEvents: valkey?.notifyKeyspaceEvents ?? '',
		databases: valkey?.databases ?? 16,
		memory: valkey?.memory ?? ValkeyMemory.GB_1,
		tier: valkey?.tier ?? ValkeyTier.HIGH_AVAILABILITY,
		maxMemoryPolicy: valkey?.maxMemoryPolicy ?? ValkeyMaxMemoryPolicy.NO_EVICTION
	}}
	button="Save changes"
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
