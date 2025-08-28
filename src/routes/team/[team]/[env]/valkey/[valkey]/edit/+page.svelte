<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ValkeyMaxMemoryPolicy,
		ValkeySize,
		ValkeyTier,
		type ValkeySize$options,
		type ValkeyTier$options,
		type ValkeyMaxMemoryPolicy$options
	} from '$houdini';
	import { BodyLong, BodyShort, Button, ErrorMessage, Select } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();

	const { UpdateValkeyData } = $derived(data);

	const planCosts: Record<ValkeyTier$options, Record<ValkeySize$options, number>> = {
		SINGLE_NODE: {
			RAM_1GB: Infinity,
			RAM_4GB: 64,
			RAM_8GB: 128,
			RAM_14GB: 214,
			RAM_28GB: 394,
			RAM_56GB: 651,
			RAM_112GB: 1277,
			RAM_200GB: 2554
		},
		HIGH_AVAILABILITY: {
			RAM_1GB: 60,
			RAM_4GB: 171,
			RAM_8GB: 342,
			RAM_14GB: 462,
			RAM_28GB: 737,
			RAM_56GB: 1337,
			RAM_112GB: 2640,
			RAM_200GB: 5057
		}
	};

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

	<Select size="small" label="Max memory policy" name="max_memory_policy" value={maxMemoryPolicy}>
		{#if !maxMemoryPolicy}
			<option value="">Default (unset)</option>
		{/if}
		{#each Object.values(ValkeyMaxMemoryPolicy) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<BodyShort>
		Estimated cost: <strong
			>{planCosts[tier][size].toLocaleString('no-NO', {
				style: 'currency',
				currency: 'EUR'
			})}</strong
		> per month
	</BodyShort>

	<Button type="submit">Save changes</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
