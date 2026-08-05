<script lang="ts">
	import { page } from '$app/state';
	import { uniqueVariableNames, workloadEnvForm } from '$lib/forms/workload-env';
	import Form from '$lib/ui/Form/Form.svelte';
	import { Alert, BodyLong, Button } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	const backHref = $derived(`/team/${page.params.team}/${page.params.env}/app/${page.params.app}`);
</script>

<div class="page">
	<BodyLong>
		Set environment variables for <strong>{page.params.app}</strong> in
		<strong>{page.params.env}</strong>. These are plain text values that will be added to the
		workload.
	</BodyLong>

	<Alert variant="warning" size="small">
		These changes are temporary and will be overwritten on next deploy. The application is restarted
		to apply them.
	</Alert>

	<Form
		fields={workloadEnvForm}
		{form}
		defaultValues={{ variables: [{ name: '', value: '' }] }}
		refine={uniqueVariableNames}
		button="Set environment variables"
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
