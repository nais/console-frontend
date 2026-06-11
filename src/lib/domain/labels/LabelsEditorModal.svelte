<script lang="ts">
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { BodyShort, Button, Heading, Modal } from '@nais/ds-svelte-community';
	import { untrack } from 'svelte';
	import LabelRows from './LabelRows.svelte';
	import {
		labelRowsHaveErrors,
		toLabelInput,
		toLabelRows,
		type Label,
		type LabelRow
	} from './labels';

	interface Props {
		labels: readonly Label[];
		title?: string;
		errors?: { message: string }[] | null;
		onsave: (labels: Label[]) => void | Promise<void>;
		onclose: () => void;
	}

	let { labels, title = 'Edit labels', errors = null, onsave, onclose }: Props = $props();

	let open = $state(true);
	let saving = $state(false);

	let rows = $state<LabelRow[]>(
		untrack(() => {
			const seeded = toLabelRows(labels);
			return seeded.length > 0 ? seeded : [{ key: '', value: '' }];
		})
	);

	let hasErrors = $derived(labelRowsHaveErrors(rows));

	const save = async () => {
		if (saving || hasErrors) {
			return;
		}
		saving = true;
		await onsave(toLabelInput(rows));
		saving = false;
	};
</script>

<Modal bind:open width="medium" {onclose}>
	{#snippet header()}
		<Heading as="h2" size="large">{title}</Heading>
	{/snippet}

	<BodyShort size="small" spacing>
		Labels are key-value pairs used to organize resources. The <code>labels.nais.io/</code> prefix is
		added automatically.
	</BodyShort>

	<LabelRows bind:rows />

	<GraphErrors {errors} />

	{#snippet footer()}
		<Button variant="primary" size="small" onclick={save} loading={saving} disabled={hasErrors}>
			Save
		</Button>
		<Button variant="secondary" size="small" type="button" onclick={onclose}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	code {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
	}
</style>
