<script lang="ts">
	import { enhance } from '$app/forms';
	import { ValkeyMaxMemoryPolicy, ValkeySize, ValkeyTier } from '$houdini';
	import { BodyLong, Button, ErrorMessage, Select, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data, form }: PageProps = $props();

	const { CreateValkeyEnvironments } = $derived(data);

	const environments = $derived($CreateValkeyEnvironments.data?.team.environments ?? []);
</script>

<BodyLong>This is an explanation on how to create a Valkey instance.</BodyLong>

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

	<Select
		size="small"
		label="Tier"
		name="tier"
		required
		value={form?.tier ?? ValkeyTier.HIGH_AVAILABILITY}
	>
		{#each Object.values(ValkeyTier) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select size="small" label="Size" name="size" required value={form?.size ?? ValkeySize.RAM_1GB}>
		{#each Object.values(ValkeySize) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Select
		size="small"
		label="Max memory policy"
		name="max_memory_policy"
		value={form?.max_memory_policy ?? ''}
	>
		<option value="">Default (unset)</option>
		{#each Object.values(ValkeyMaxMemoryPolicy) as opt (opt)}
			<option value={opt}>{opt}</option>
		{/each}
	</Select>

	<Button type="submit">Create Valkey instance</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
