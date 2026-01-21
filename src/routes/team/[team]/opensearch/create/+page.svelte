<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import {
		OpenSearchMajorVersion,
		type OpenSearchMajorVersion$options,
		OpenSearchMemory,
		type OpenSearchMemory$options,
		OpenSearchTier,
		type OpenSearchTier$options
	} from '$houdini';
	import { openSearchPlanCosts, storageRequirements } from '$lib/utils/aivencost';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Button,
		ErrorMessage,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import { getTeamContext } from '../../teamContext.svelte';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	const { CreateOpenSearchEnvironments } = $derived(data);

	const environments = $derived(
		($CreateOpenSearchEnvironments.data?.team.environments ?? []).filter(
			(env) => !!env.gcpProjectID
		)
	);

	const form = $derived(page.form);

	let tier = $derived((form?.tier as OpenSearchTier$options) ?? OpenSearchTier.SINGLE_NODE);

	let memory = $derived.by(() => {
		const formMemory = (form?.memory as OpenSearchMemory$options) ?? OpenSearchMemory.GB_4;

		// prevent invalid memory when tier changes
		if (tier === OpenSearchTier.HIGH_AVAILABILITY && formMemory === OpenSearchMemory.GB_2) {
			return OpenSearchMemory.GB_4;
		}
		return formMemory;
	});

	let version = $derived(
		(form?.version as OpenSearchMajorVersion$options) ?? OpenSearchMajorVersion.V3_3
	);

	let minStorage = $derived(storageRequirements[tier][memory].min);
	let maxStorage = $derived(storageRequirements[tier][memory].max);

	let storage = $derived.by(() => {
		const formStorage = Number(form?.storageGB) || minStorage;

		if (formStorage < minStorage || formStorage > maxStorage) {
			return minStorage;
		}
		return formStorage;
	});

	let availableMemories = $derived(
		Object.values(OpenSearchMemory).filter((memory) => {
			if (tier == OpenSearchTier.HIGH_AVAILABILITY && memory == OpenSearchMemory.GB_2) {
				return false;
			}
			return true;
		})
	);

	const teamCtx = getTeamContext();
</script>

<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			teamCtx.refetchInventory();
		};
	}}
>
	<BodyLong style="margin-bottom: 1rem;"
		>This will create a new OpenSearch instance for <span style="font-weight: bold;"
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

	<Select size="small" label="Desired version" name="version" required bind:value={version}>
		{#each Object.values(OpenSearchMajorVersion) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Tier" name="tier" required bind:value={tier}>
		{#each Object.values(OpenSearchTier) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Memory" name="memory" required bind:value={memory}>
		{#each availableMemories as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<TextField
		size="small"
		type="number"
		label="Storage (GB)"
		name="storageGB"
		htmlSize={7}
		required
		min={minStorage}
		max={maxStorage}
		step={storageRequirements[tier][memory].increments}
		readonly={minStorage === maxStorage}
		bind:value={storage}
	>
		{#snippet description()}
			{#if minStorage === maxStorage}
				<BodyShort>Storage: {minStorage} GB (fixed)</BodyShort>
			{:else}
				<BodyShort>
					Available storage: {minStorage} - {maxStorage} GB.<br />
					Must be an increment of {storageRequirements[tier][memory].increments} GB.
				</BodyShort>
			{/if}
		{/snippet}
	</TextField>

	<BodyShort>
		Estimated cost: <strong
			>{openSearchPlanCosts[tier][memory].toLocaleString('no-NO', {
				style: 'currency',
				currency: 'EUR'
			})}</strong
		> per month
	</BodyShort>

	{#if form?.error}
		<ErrorMessage>{form.error}</ErrorMessage>
	{/if}

	{#if tier === OpenSearchTier.SINGLE_NODE && memory === OpenSearchMemory.GB_2}
		<Alert variant="warning" size="small">
			This combination of tier and memory is not recommended for production workloads.<br />
			Limitations include no guarantees for uptime and availability, no detailed metrics, and limited
			backups.
		</Alert>
	{/if}

	<Button type="submit">Create OpenSearch instance</Button>
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
