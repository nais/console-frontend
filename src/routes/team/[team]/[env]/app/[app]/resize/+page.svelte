<script lang="ts">
	import { page } from '$app/state';
	import { maxAtLeastMin, resizeApplicationForm } from '$lib/forms/workload';
	import Form from '$lib/ui/Form/Form.svelte';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data, form }: PageProps = $props();

	const { ResizeApplicationData } = $derived(data);
	const scaling = $derived(
		$ResizeApplicationData.data?.team?.environment?.application?.resources?.scaling ?? null
	);

	const backHref = $derived(`/team/${page.params.team}/${page.params.env}/app/${page.params.app}`);
</script>

<div class="page">
	<BodyLong>
		Set the number of replicas for <strong>{page.params.app}</strong> in
		<strong>{page.params.env}</strong>.
	</BodyLong>

	<Form
		fields={resizeApplicationForm}
		{form}
		refine={maxAtLeastMin}
		defaultValues={{ min: scaling?.minInstances ?? 0, max: scaling?.maxInstances ?? 0 }}
		button="Resize application"
	>
		{#snippet actions()}
			<Button as="a" size="small" variant="tertiary" href={backHref}>Cancel</Button>
		{/snippet}
	</Form>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		max-width: 600px;
	}
</style>
