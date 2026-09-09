<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import {
		ValkeyMaxMemoryPolicy,
		type ValkeyMaxMemoryPolicy$options,
		ValkeyMemory,
		type ValkeyMemory$options,
		ValkeyTier,
		type ValkeyTier$options
	} from '$houdini';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { valkeyPlanCosts } from '$lib/utils/aivencost';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Button,
		Checkbox,
		ErrorMessage,
		ReadMore,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { CreateValkeyEnvironments } = $derived(data);

	const environments = $derived(
		($CreateValkeyEnvironments.data?.team.environments ?? []).filter((env) => !!env.gcpProjectID)
	);

	const form: PageProps['form'] = $derived(page.form);

	let tier = $derived((form?.tier as ValkeyTier$options) ?? ValkeyTier.HIGH_AVAILABILITY);
	let memory = $derived((form?.memory as ValkeyMemory$options) ?? ValkeyMemory.GB_1);
	let maxMemoryPolicy = $derived(
		(form?.max_memory_policy as ValkeyMaxMemoryPolicy$options) ?? ValkeyMaxMemoryPolicy.NO_EVICTION
	);
	let persistenceDisabled = $derived((form?.persistence_disabled as boolean) ?? false);

	let readMoreOpen = $derived.by(() => {
		if (form?.persistence_disabled) {
			return true;
		}
		if (form?.databases && form.databases != '16') {
			return true;
		}
		if (form?.notify_keyspace_events && form.notify_keyspace_events != '') {
			return true;
		}

		return false;
	});

	const valkeyMemoryList = $derived.by(() => {
		return Object.values(ValkeyMemory).sort((a, b) => {
			const aParts = a.split('_');
			const bParts = b.split('_');

			if (aParts[0] === bParts[0]) {
				return Number(aParts[1]) - Number(bParts[1]);
			}
			return aParts[0] === 'GB' ? 1 : -1;
		});
	});

	function tierLabel(t: ValkeyTier$options) {
		switch (t) {
			case ValkeyTier.SINGLE_NODE:
				return 'Single node';
			case ValkeyTier.HIGH_AVAILABILITY:
				return 'High availability';
		}
	}

	function memoryLabel(m: ValkeyMemory$options) {
		const parts = m.split('_');
		return `${parts[1]} ${parts[0]}`;
	}

	function maxMemoryPolicyLabel(m: ValkeyMaxMemoryPolicy$options) {
		switch (m) {
			case ValkeyMaxMemoryPolicy.NO_EVICTION:
				return 'No eviction';
			case ValkeyMaxMemoryPolicy.ALLKEYS_LRU:
				return 'Allkeys LRU';
			case ValkeyMaxMemoryPolicy.ALLKEYS_LFU:
				return 'Allkeys LFU';
			case ValkeyMaxMemoryPolicy.VOLATILE_LRU:
				return 'Volatile LRU';
			case ValkeyMaxMemoryPolicy.VOLATILE_LFU:
				return 'Volatile LFU';
			case ValkeyMaxMemoryPolicy.ALLKEYS_RANDOM:
				return 'Allkeys random';
			case ValkeyMaxMemoryPolicy.VOLATILE_RANDOM:
				return 'Volatile random';
			case ValkeyMaxMemoryPolicy.VOLATILE_TTL:
				return 'Volatile TTL';
			default:
				return m;
		}
	}
</script>

<form method="POST" use:enhance>
	<BodyLong style="margin-bottom: 1rem;"
		>This will create a new Valkey instance for <span style="font-weight: bold;"
			>{data.teamSlug}</span
		>.</BodyLong
	>

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
			<option value={opt}>{tierLabel(opt)}</option>
		{/each}
	</Select>

	<Select size="small" label="Memory" name="memory" required bind:value={memory}>
		{#each valkeyMemoryList as opt (opt)}
			<option value={opt}>{memoryLabel(opt)}</option>
		{/each}
	</Select>

	<Select
		size="small"
		label="Max memory policy"
		name="max_memory_policy"
		bind:value={maxMemoryPolicy}
	>
		{#snippet description()}
			Automatically evict old data as you add new data, see the <ExternalLink
				href="https://valkey.io/topics/lru-cache/">Valkey documentation</ExternalLink
			> for details.
		{/snippet}
		{#each Object.values(ValkeyMaxMemoryPolicy) as opt (opt)}
			<option value={opt}>{maxMemoryPolicyLabel(opt)}</option>
		{/each}
	</Select>

	<ReadMore header="Advanced options" size="small" open={readMoreOpen}>
		<TextField
			size="small"
			label="Notify keyspace events"
			name="notify_keyspace_events"
			value={form?.notify_keyspace_events ?? ''}
		>
			{#snippet description()}
				See the
				<ExternalLink href="https://valkey.io/topics/notifications">
					Valkey documentation</ExternalLink
				> for details.
			{/snippet}
		</TextField>
		<TextField
			size="small"
			label="Number of databases"
			name="databases"
			type="number"
			min={1}
			max={128}
			step={1}
			value={form?.databases ?? '16'}
		>
			{#snippet description()}
				Default is 16. Minimum 1, maximum 128. Changing this will cause a restart of the Valkey
				service.
			{/snippet}
		</TextField>
		<Checkbox
			name="persistence_disabled"
			size="small"
			bind:checked={persistenceDisabled}
			description="Disables RDB dumps and backups. All data is lost if the instance restarts."
		>
			Disable persistence
		</Checkbox>
	</ReadMore>

	<BodyShort>
		Estimated cost: <strong
			>{valkeyPlanCosts[tier][memory].toLocaleString('no-NO', {
				style: 'currency',
				currency: 'EUR'
			})}</strong
		> per month
	</BodyShort>

	{#if form?.error}
		<ErrorMessage>{form.error}</ErrorMessage>
	{/if}

	{#if tier === ValkeyTier.SINGLE_NODE && memory === ValkeyMemory.GB_1}
		<Alert variant="warning" size="small" style="margin-bottom: 1rem;">
			This combination of tier and memory is not recommended for production workloads.<br />
			Limitations include no guarantees for uptime and availability, no detailed metrics, and limited
			backups.
		</Alert>
	{/if}

	<Button type="submit">Create Valkey instance</Button>
</form>

<style>
	form {
		width: 600px;
	}

	form :global(.aksel-form-field) {
		max-width: 400px;
	}

	form :global(> *) {
		margin-bottom: 1rem;
	}
</style>
