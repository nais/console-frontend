<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import {
		ValkeyMaxMemoryPolicy,
		ValkeySize,
		type ValkeySize$options,
		ValkeyTier,
		type ValkeyTier$options
	} from '$houdini';
	import { valkeyPlanCosts } from '$lib/utils/aivencost';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Button,
		ErrorMessage,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	const { CreateValkeyEnvironments } = $derived(data);

	const environments = $derived($CreateValkeyEnvironments.data?.team.environments ?? []);

	const form = $derived(page.form);

	let tier = $derived((form?.tier as ValkeyTier$options) ?? ValkeyTier.HIGH_AVAILABILITY);
	let size = $derived((form?.size as ValkeySize$options) ?? ValkeySize.RAM_1GB);
</script>

<BodyLong>This is an explanation on how to create a Valkey instance.</BodyLong>

{#if form?.error}
	<ErrorMessage>{form.error}</ErrorMessage>
{/if}

{#if tier === ValkeyTier.SINGLE_NODE && size === ValkeySize.RAM_1GB}
	<Alert variant="warning" size="small">
		This combination of tier and size is not recommended for production workloads.<br />
		Limitations include no guarantees for uptime and availability, no detailed metrics, limited backups,
		and so on.
	</Alert>
{/if}

<form method="POST" use:enhance>
	<TextField size="small" label="Instance name" name="name" required value={form?.name ?? ''} />

	<Select
		size="small"
		label="Environment"
		name="environment"
		required
		value={form?.environment ?? environments.at(0)?.environment.name}
	>
		{#each environments ?? [] as env (env.environment.name)}
			<option value={env.environment.name}>{env.environment.name}</option>
		{/each}
	</Select>

	<Select size="small" label="Tier" name="tier" required bind:value={tier}>
		{#each Object.values(ValkeyTier) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Size" name="size" required bind:value={size}>
		{#each Object.values(ValkeySize) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select
		size="small"
		label="Max memory policy"
		name="max_memory_policy"
		value={form?.max_memory_policy ?? ''}
	>
		<option value="">Default (unset)</option>
		{#each Object.values(ValkeyMaxMemoryPolicy) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<BodyShort>
		Estimated cost: <strong
			>{valkeyPlanCosts[tier][size].toLocaleString('no-NO', {
				style: 'currency',
				currency: 'EUR'
			})}</strong
		> per month
	</BodyShort>

	<Button type="submit">Create Valkey instance</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
