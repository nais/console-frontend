<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ValkeyMaxMemoryPolicy,
		ValkeySize,
		ValkeyTier,
		type ValkeyMaxMemoryPolicy$options,
		type ValkeySize$options,
		type ValkeyTier$options
	} from '$houdini';
	import { valkeyPlanCosts } from '$lib/utils/aivencost';
	import {
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
	let size = $derived(
		(form?.size as ValkeySize$options) ??
			$UpdateValkeyData.data?.team.environment.valkey.size ??
			ValkeySize.RAM_1GB
	);
	let maxMemoryPolicy = $derived(
		(form?.max_memory_policy as ValkeyMaxMemoryPolicy$options) ??
			$UpdateValkeyData.data?.team.environment.valkey.maxMemoryPolicy ??
			''
	);

	const tomlManifest = $derived(`[valkey.${$UpdateValkeyData.data?.team.environment.valkey.name}]
tier = "${tier}"
size = "${size}"
${maxMemoryPolicy ? `max_memory_policy = "${maxMemoryPolicy}"` : ``}`);
</script>

<BodyLong>This is an explanation on how to edit a Valkey instance.</BodyLong>

{#if form?.error}
	<ErrorMessage>{form.error}</ErrorMessage>
{/if}

<form method="POST" use:enhance>
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
			>{valkeyPlanCosts[tier][size].toLocaleString('no-NO', {
				style: 'currency',
				currency: 'EUR'
			})}</strong
		> per month
	</BodyShort>

	<Button type="submit">Save changes</Button>
</form>

<ReadMore header="Nais TOML Manifest (ALPHA)" size="small">
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
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
