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
	import { docURL } from '$lib/doc';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { openSearchPlanCosts, storageRequirements } from '$lib/utils/aivencost';
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
		Object.values(OpenSearchMemory)
			.filter((memory) => {
				if (tier == OpenSearchTier.HIGH_AVAILABILITY && memory == OpenSearchMemory.GB_2) {
					return false;
				}
				return true;
			})
			.sort((a, b) => {
				return Number(a.replace('GB_', '')) - Number(b.replace('GB_', ''));
			})
	);

	let httpMaxContentLength = $derived(
		(form?.http_max_content_length as string) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.httpMaxContentLength ??
			''
	);
	let indicesQueryBoolMaxClauseCount = $derived(
		(form?.indices_query_bool_max_clause_count as string) ??
			String(
				$UpdateOpenSearchData.data?.team.environment.openSearch.indicesQueryBoolMaxClauseCount ?? ''
			)
	);
	let shardIndexingPressureEnabled = $derived(
		(form?.shard_indexing_pressure_enabled as boolean) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.shardIndexingPressureEnabled ??
			false
	);
	let shardIndexingPressureEnforced = $derived(
		(form?.shard_indexing_pressure_enforced as boolean) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.shardIndexingPressureEnforced ??
			false
	);

	const tomlManifest =
		$derived(`[openSearch.${$UpdateOpenSearchData.data?.team.environment.openSearch.name}]
tier = "${tier}"
memory = "${memory}"
version = "${version}"
storageGB = "${storage}"
`);

	function versionLabel(v: OpenSearchMajorVersion$options) {
		return v.replaceAll('_', '.').replace('V', 'v');
	}

	function tierLabel(t: OpenSearchTier$options) {
		switch (t) {
			case OpenSearchTier.SINGLE_NODE:
				return 'Single node';
			case OpenSearchTier.HIGH_AVAILABILITY:
				return 'High availability';
		}
	}

	function memoryLabel(m: OpenSearchMemory$options) {
		switch (m) {
			case OpenSearchMemory.GB_2:
				return '2 GB';
			case OpenSearchMemory.GB_4:
				return '4 GB';
			case OpenSearchMemory.GB_8:
				return '8 GB';
			case OpenSearchMemory.GB_16:
				return '16 GB';
			case OpenSearchMemory.GB_32:
				return '32 GB';
			case OpenSearchMemory.GB_64:
				return '64 GB';
		}
	}
</script>

<form method="POST" use:enhance>
	<Alert variant="info" size="small">
		<BodyShort size="small">
			Changing these settings may cause a restart of this OpenSearch instance.
		</BodyShort>
		<BodyShort size="small">
			If you're upgrading major versions, consult the
			<ExternalLink href={docURL('/persistence/opensearch/how-to/upgrade-major-version')}>
				migration guide
			</ExternalLink>
			first.
		</BodyShort>
	</Alert>
	<Select size="small" label="Desired version" name="version" required bind:value={version}>
		{#each Object.values(OpenSearchMajorVersion) as opt (opt)}
			<option value={opt}>{versionLabel(opt)}</option>
		{/each}
	</Select>

	<Select size="small" label="Tier" name="tier" required bind:value={tier}>
		{#each Object.values(OpenSearchTier) as opt (opt)}
			<option value={opt}>{tierLabel(opt)}</option>
		{/each}
	</Select>

	<Select size="small" label="Memory" name="memory" required bind:value={memory}>
		{#each availableMemories as opt (opt)}
			<option value={opt}>{memoryLabel(opt)}</option>
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

	<ReadMore
		header="Advanced options"
		size="small"
		open={httpMaxContentLength !== '' ||
			indicesQueryBoolMaxClauseCount !== '' ||
			shardIndexingPressureEnabled ||
			shardIndexingPressureEnforced}
	>
		<TextField
			size="small"
			label="HTTP max content length"
			name="http_max_content_length"
			placeholder="100Mi"
			bind:value={httpMaxContentLength}
		>
			{#snippet description()}
				Maximum request size, for example <code>100Mi</code> or <code>1Gi</code>. Defaults to 100Mi.
			{/snippet}
		</TextField>
		<TextField
			size="small"
			label="Boolean query max clause count"
			name="indices_query_bool_max_clause_count"
			type="number"
			min={64}
			max={4096}
			step={1}
			placeholder="1024"
			bind:value={indicesQueryBoolMaxClauseCount}
		>
			{#snippet description()}
				Maximum clauses in a Lucene BooleanQuery. Defaults to 1024. Higher values may affect
				performance.
			{/snippet}
		</TextField>
		<Checkbox
			name="shard_indexing_pressure_enabled"
			size="small"
			bind:checked={shardIndexingPressureEnabled}
			description="Track shard-level indexing pressure."
		>
			Enable shard indexing pressure
		</Checkbox>
		<Checkbox
			name="shard_indexing_pressure_enforced"
			size="small"
			bind:checked={shardIndexingPressureEnforced}
			description="Reject requests that may degrade cluster performance instead of only tracking metrics."
		>
			Enforce shard indexing pressure
		</Checkbox>
	</ReadMore>

	<input
		type="hidden"
		name="labels"
		value={JSON.stringify($UpdateOpenSearchData.data?.team.environment.openSearch.labels ?? [])}
	/>

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
