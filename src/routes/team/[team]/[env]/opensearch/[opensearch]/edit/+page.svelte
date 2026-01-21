<script lang="ts">
	import { enhance } from '$app/forms';
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
		CopyButton,
		ErrorMessage,
		ReadMore,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { form, data }: PageProps = $props();

	const { UpdateOpenSearchData } = $derived(data);

	let tier = $derived(
		(form?.tier as OpenSearchTier$options) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.tier ??
			OpenSearchTier.SINGLE_NODE
	);

	let memory = $derived.by(() => {
		const formMemory =
			(form?.memory as OpenSearchMemory$options) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.memory ??
			OpenSearchMemory.GB_4;

		// prevent invalid memory when tier changes
		if (tier === OpenSearchTier.HIGH_AVAILABILITY && formMemory === OpenSearchMemory.GB_2) {
			return OpenSearchMemory.GB_4;
		}
		return formMemory;
	});

	let version = $derived(
		(form?.version as OpenSearchMajorVersion$options) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.version.desiredMajor ??
			''
	);

	let minStorage = $derived(storageRequirements[tier][memory].min);
	let maxStorage = $derived(storageRequirements[tier][memory].max);

	let storage = $derived.by(() => {
		const formStorage =
			Number(form?.storageGB) ||
			$UpdateOpenSearchData.data?.team.environment.openSearch.storageGB ||
			minStorage;

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

	const tomlManifest =
		$derived(`[openSearch.${$UpdateOpenSearchData.data?.team.environment.openSearch.name}]
tier = "${tier}"
memory = "${memory}"
version = "${version}"
storageGB = "${storage}"
`);
</script>

<form method="POST" use:enhance>
	<Alert variant="info" size="small"
		>Changing these settings may cause a restart of this OpenSearch instance.</Alert
	>

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
					Must be an increment of {storageRequirements[tier][memory].increments} GB.<br />
					Reducing will result in the service re-balancing.
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

	<Button type="submit">Save changes</Button>
</form>

<ReadMore header="Nais TOML Manifest (ALPHA)" size="small" style="display: none;">
	<BodyLong>
		The manifest below can be added to your <code>nais.toml</code> file. You can then use
		<code>nais alpha apply</code> to manage the lifecycle of your OpenSearch.
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
