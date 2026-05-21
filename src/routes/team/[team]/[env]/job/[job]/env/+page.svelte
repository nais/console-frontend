<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import { Alert, BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import { SvelteSet } from 'svelte/reactivity';

	const form = $derived(page.form);

	let rows = $state([{ name: '', value: '' }]);

	let success = $state(false);
	let closeButtonEl: HTMLButtonElement | undefined = $state();

	function addRow() {
		rows.push({ name: '', value: '' });
	}

	function removeRow(index: number) {
		rows.splice(index, 1);
	}

	let duplicateKeys = $derived.by(() => {
		const seen = new SvelteSet<string>();
		const dupes = new SvelteSet<string>();
		for (const row of rows) {
			const key = row.name.trim();
			if (key && seen.has(key)) {
				dupes.add(key);
			}
			if (key) seen.add(key);
		}
		return dupes;
	});

	let hasDuplicates = $derived(duplicateKeys.size > 0);

	const close = async () => {
		await goto(`/team/${page.params.team}/${page.params.env}/job/${page.params.job}`, {
			replaceState: isPossiblyInModal(),
			invalidateAll: true
		});
	};

	$effect(() => {
		if (success) {
			queueMicrotask(() => closeButtonEl?.focus());
		}
	});
</script>

{#if success}
	<div class="wrapper" role="status" aria-live="polite" aria-atomic="true">
		<Alert variant="success" size="small">
			Successfully set environment variables. Restarting job to apply changes.
		</Alert>
		<Button variant="tertiary" size="small" onclick={close} bind:ref={closeButtonEl}>Close</Button>
	</div>
{:else}
	<form
		method="POST"
		action="/team/{page.params.team}/{page.params.env}/job/{page.params.job}/env"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'redirect') {
					success = true;
				} else if (result.type === 'failure') {
					const { applyAction } = await import('$app/forms');
					await applyAction(result);
				}
			};
		}}
	>
		<BodyLong style="margin-bottom: 1rem;">
			Set environment variables for <strong>{page.params.job}</strong> in
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

		{#if hasDuplicates}
			<ErrorMessage>Duplicate keys are not allowed.</ErrorMessage>
		{/if}
		{#if form?.error}
			<ErrorMessage>{form.error}</ErrorMessage>
		{/if}

		<div class="button-row">
			<Button type="submit" size="small" disabled={hasDuplicates}>Set environment variables</Button>
			<Button variant="tertiary" size="small" type="button" onclick={close}>Cancel</Button>
		</div>
	</form>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		width: 500px;
		align-items: flex-start;
	}

	form {
		width: 600px;
	}

	form :global(> *) {
		margin-bottom: 1rem;
	}

	.button-row {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
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
