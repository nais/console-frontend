<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		OpenSearchMajorVersion,
		OpenSearchSize,
		OpenSearchTier,
		type OpenSearchMajorVersion$options,
		type OpenSearchSize$options,
		type OpenSearchTier$options
	} from '$houdini';
	import { BodyLong, BodyShort, Button, ErrorMessage, Select } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();

	const { UpdateOpenSearchData } = $derived(data);

	const planCosts: Record<OpenSearchTier$options, Record<OpenSearchSize$options, number>> = {
		SINGLE_NODE: {
			RAM_4GB: 77,
			RAM_8GB: 154,
			RAM_16GB: 308,
			RAM_32GB: 616,
			RAM_64GB: 1231
		},
		HIGH_AVAILABILITY: {
			RAM_4GB: 235,
			RAM_8GB: 470,
			RAM_16GB: 940,
			RAM_32GB: 1881,
			RAM_64GB: 3763
		}
	};

	let tier = $derived(
		(form?.tier as OpenSearchTier$options) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.tier ??
			OpenSearchTier.SINGLE_NODE
	);
	let size = $derived(
		(form?.size as OpenSearchSize$options) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.size ??
			OpenSearchSize.RAM_4GB
	);
	let version = $derived(
		(form?.version as OpenSearchMajorVersion$options) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.version.desiredMajor ??
			''
	);
</script>

<BodyLong>This is an explanation on how to edit a OpenSearch instance.</BodyLong>

{#if form?.error}
	<ErrorMessage>{form.error}</ErrorMessage>
{/if}

<form method="POST" use:enhance>
	<Select size="small" label="Tier" name="tier" required bind:value={tier}>
		{#each Object.values(OpenSearchTier) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Size" name="size" required bind:value={size}>
		{#each Object.values(OpenSearchSize) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Major version" name="version" required bind:value={version}>
		{#each Object.values(OpenSearchMajorVersion) as opt (opt)}
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
