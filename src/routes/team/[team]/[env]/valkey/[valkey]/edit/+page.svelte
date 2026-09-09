<script lang="ts">
	import { enhance } from '$app/forms';
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
		CopyButton,
		ErrorMessage,
		ReadMore,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();

	const { UpdateValkeyData } = $derived(data);

	let tier = $derived(
		(form?.tier as ValkeyTier$options) ??
			$UpdateValkeyData.data?.team.environment.valkey.tier ??
			ValkeyTier.HIGH_AVAILABILITY
	);
	let memory = $derived(
		(form?.memory as ValkeyMemory$options) ??
			$UpdateValkeyData.data?.team.environment.valkey.memory ??
			ValkeyMemory.GB_1
	);
	let maxMemoryPolicy = $derived(
		(form?.max_memory_policy as ValkeyMaxMemoryPolicy$options) ??
			$UpdateValkeyData.data?.team.environment.valkey.maxMemoryPolicy ??
			ValkeyMaxMemoryPolicy.NO_EVICTION
	);
	let notifyKeyspaceEvents = $derived(
		(form?.notify_keyspace_events as string) ??
			$UpdateValkeyData.data?.team.environment.valkey.notifyKeyspaceEvents ??
			''
	);
	let databases = $derived(
		(form?.databases as string) ??
			String($UpdateValkeyData.data?.team.environment.valkey.databases ?? 16)
	);
	let persistenceDisabled = $derived(
		(form?.persistence_disabled as boolean) ??
			$UpdateValkeyData.data?.team.environment.valkey.persistenceDisabled ??
			false
	);

	const tomlManifest = $derived(`[valkey.${$UpdateValkeyData.data?.team.environment.valkey.name}]
tier = "${tier}"
memory = "${memory}"
${maxMemoryPolicy ? `max_memory_policy = "${maxMemoryPolicy}"` : ``}
${notifyKeyspaceEvents ? `notify_keyspace_events = "${notifyKeyspaceEvents}"` : ``}`);

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
	<Alert variant="info" size="small"
		>Changing these settings may cause a restart of this Valkey instance.</Alert
	>

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

	<ReadMore
		header="Advanced options"
		size="small"
		open={notifyKeyspaceEvents !== '' || databases !== '16' || persistenceDisabled}
	>
		<TextField
			size="small"
			label="Notify keyspace events"
			name="notify_keyspace_events"
			bind:value={notifyKeyspaceEvents}
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
			bind:value={databases}
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
		<Alert variant="warning" size="small">
			This combination of tier and memory is not recommended for production workloads.<br />
			Limitations include no guarantees for uptime and availability, no detailed metrics, and limited
			backups.
		</Alert>
	{/if}

	<input
		type="hidden"
		name="labels"
		value={JSON.stringify($UpdateValkeyData.data?.team.environment.valkey.labels ?? [])}
	/>

	<Button type="submit">Save changes</Button>
</form>

<ReadMore header="Nais TOML Manifest (ALPHA)" size="small" style="display: none;">
	<BodyLong>
		The manifest below can be added to your <code>nais.toml</code> file. You can then use
		<code>nais alpha apply</code> to manage the lifecycle of your Valkey.
	</BodyLong>
	<pre class="manifest">{tomlManifest}</pre>
	<CopyButton
		activeText="TOML copied"
		text="Copy TOML to clipboard"
		variant="neutral"
		copyText={tomlManifest}
		size="xsmall"
	/>
</ReadMore>

<style>
	form :global(.aksel-form-field) {
		max-width: 400px;
	}

	form :global(> *) {
		margin-bottom: 1rem;
	}
</style>
