<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		OpenSearchMajorVersion,
		type OpenSearchMajorVersion$options,
		OpenSearchSize,
		type OpenSearchSize$options,
		OpenSearchTier,
		type OpenSearchTier$options
	} from '$houdini';
	import { diskRequirements, openSearchPlanCosts } from '$lib/utils/aivencost';
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
	let diskSize = $derived(
		(form?.diskSizeGB as string) ??
			$UpdateOpenSearchData.data?.team.environment.openSearch.diskSizeGB ??
			diskRequirements[tier][size].min
	);

	const availableSizes = $derived(
		Object.values(OpenSearchSize).filter((size) => {
			if (tier == OpenSearchTier.HIGH_AVAILABILITY && size == OpenSearchSize.RAM_2GB) {
				return false;
			}
			return true;
		})
	);

	const minDiskSize = $derived(diskRequirements[tier][size].min);
	const maxDiskSize = $derived(diskRequirements[tier][size].max);

	const tomlManifest =
		$derived(`[openSearch.${$UpdateOpenSearchData.data?.team.environment.openSearch.name}]
tier = "${tier}"
size = "${size}"
version = "${version}"
diskSizeGB = "${diskSize}"
`);
</script>

<form method="POST" use:enhance>
	<Alert variant="info" size="small"
		>Changing these settings may cause a restart of this OpenSearch instance.</Alert
	>

	<Select size="small" label="Major version" name="version" required bind:value={version}>
		{#each Object.values(OpenSearchMajorVersion) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Tier" name="tier" required bind:value={tier}>
		{#each Object.values(OpenSearchTier) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Size" name="size" required bind:value={size}>
		{#each availableSizes as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<TextField
		size="small"
		type="number"
		label="Disk size (GB)"
		name="diskSizeGB"
		htmlSize={7}
		required
		min={diskRequirements[tier][size].min}
		max={diskRequirements[tier][size].max}
		readonly={minDiskSize == maxDiskSize}
		bind:value={diskSize}
	>
		{#snippet description()}
			{#if minDiskSize == maxDiskSize}
				<BodyShort>Disk size: {minDiskSize} GB (fixed)</BodyShort>
			{:else}
				<BodyShort
					>Available disk size: {minDiskSize} - {maxDiskSize} GB. Reducing will result in the service
					re-balancing.</BodyShort
				>
			{/if}
		{/snippet}
	</TextField>

	<BodyShort>
		Estimated cost: <strong
			>{openSearchPlanCosts[tier][size].toLocaleString('no-NO', {
				style: 'currency',
				currency: 'EUR'
			})}</strong
		> per month
	</BodyShort>

	{#if form?.error}
		<ErrorMessage>{form.error}</ErrorMessage>
	{/if}

	{#if tier === OpenSearchTier.SINGLE_NODE && size === OpenSearchSize.RAM_2GB}
		<Alert variant="warning" size="small">
			This combination of tier and size is not recommended for production workloads.<br />
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
