<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import {
		OpenSearchMajorVersion,
		OpenSearchSize,
		OpenSearchTier,
		type OpenSearchMajorVersion$options,
		type OpenSearchSize$options,
		type OpenSearchTier$options
	} from '$houdini';
	import { openSearchPlanCosts } from '$lib/utils/aivencost';
	import {
		BodyLong,
		BodyShort,
		Button,
		ErrorMessage,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	const { CreateOpenSearchEnvironments } = $derived(data);

	const environments = $derived($CreateOpenSearchEnvironments.data?.team.environments ?? []);

	const form = $derived(page.form);

	let tier = $derived((form?.tier as OpenSearchTier$options) ?? OpenSearchTier.SINGLE_NODE);
	let size = $derived((form?.size as OpenSearchSize$options) ?? OpenSearchSize.RAM_4GB);
	let version = $derived(
		(form?.version as OpenSearchMajorVersion$options) ?? OpenSearchMajorVersion.V2
	);
</script>

<BodyLong>This is an explanation on how to create a OpenSearch instance.</BodyLong>

{#if form?.error}
	<ErrorMessage>{form.error}</ErrorMessage>
{/if}

<form method="POST" use:enhance>
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
			>{openSearchPlanCosts[tier][size].toLocaleString('no-NO', {
				style: 'currency',
				currency: 'EUR'
			})}</strong
		> per month
	</BodyShort>

	<Button type="submit">Create OpenSearch instance</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
