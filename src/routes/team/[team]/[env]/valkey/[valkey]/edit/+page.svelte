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
	import { valkeyPlanCosts } from '$lib/utils/aivencost';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Button,
		CopyButton,
		ErrorMessage,
		ReadMore,
		Select
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

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
			''
	);

	const tomlManifest = $derived(`[valkey.${$UpdateValkeyData.data?.team.environment.valkey.name}]
tier = "${tier}"
memory = "${memory}"
${maxMemoryPolicy ? `max_memory_policy = "${maxMemoryPolicy}"` : ``}`);
</script>

<form method="POST" use:enhance>
	<Alert variant="info" size="small"
		>Changing these settings may cause a restart of this Valkey instance.</Alert
	>

	<Select size="small" label="Tier" name="tier" required bind:value={tier}>
		{#each Object.values(ValkeyTier) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Memory" name="memory" required bind:value={memory}>
		{#each Object.values(ValkeyMemory) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select
		size="small"
		label="Max memory policy"
		name="max_memory_policy"
		bind:value={maxMemoryPolicy}
	>
		{#if !maxMemoryPolicy}
			<option value="">Default (unset)</option>
		{/if}
		{#each Object.values(ValkeyMaxMemoryPolicy) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

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
