<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import { Alert, BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';

	const form = $derived(page.form);

	let rows = $state([{ name: '', value: '' }]);

	function addRow() {
		rows.push({ name: '', value: '' });
	}

	function removeRow(index: number) {
		rows.splice(index, 1);
	}
</script>

<form
	method="POST"
	action="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/env"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				await goto(result.location, {
					replaceState: isPossiblyInModal(),
					invalidateAll: true,
					state: {
						showMessage: [
							{
								id: crypto.randomUUID(),
								target: 'instance_groups',
								type: 'success',
								text: 'Successfully set environment variables. Restarting application to apply changes.'
							}
						]
					}
				});
			} else if (result.type === 'failure') {
				const { applyAction } = await import('$app/forms');
				await applyAction(result);
			}
		};
	}}
>
	<BodyLong style="margin-bottom: 1rem;">
		Set environment variables for <strong>{page.params.app}</strong> in
		<strong>{page.params.env}</strong>. These are plain text values that will be added to the
		workload.
	</BodyLong>

	<Alert variant="warning" size="small" style="margin-bottom: 1rem;">
		These changes are temporary and will be overwritten on next deploy.
	</Alert>

	{#each rows as row, i (i)}
		<div class="env-row">
			<TextField
				size="small"
				label={i === 0 ? 'Name' : ''}
				name="env_name"
				placeholder="KEY"
				required
				bind:value={row.name}
			/>
			<TextField
				size="small"
				label={i === 0 ? 'Value' : ''}
				name="env_value"
				placeholder="value"
				bind:value={row.value}
			/>
			{#if rows.length > 1}
				<Button
					size="small"
					variant="tertiary-neutral"
					icon={TrashIcon}
					onclick={() => removeRow(i)}
					type="button"
				/>
			{/if}
		</div>
	{/each}

	<Button size="small" variant="secondary" icon={PlusIcon} onclick={addRow} type="button">
		Add variable
	</Button>

	<br />
	{#if form?.error}
		<ErrorMessage>{form.error}</ErrorMessage>
	{/if}

	<Button type="submit">Set environment variables</Button>
</form>

<style>
	form {
		width: 600px;
	}

	form :global(> *) {
		margin-bottom: 1rem;
	}

	.env-row {
		display: flex;
		gap: var(--ax-space-8);
		align-items: flex-end;
	}

	.env-row :global(.aksel-form-field) {
		flex: 1;
	}
</style>
