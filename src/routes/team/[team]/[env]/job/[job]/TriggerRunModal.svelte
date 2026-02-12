<script lang="ts">
	import { generateJobRunName } from '$lib/utils/jobRunName';
	import { BodyShort, Button, Modal, TextField } from '@nais/ds-svelte-community';

	interface Props {
		jobName: string;
		environment: string;
		submit: (runName: string) => void;
		close: () => void;
	}
	let { jobName, environment, submit, close }: Props = $props();

	let error: string = $state('');

	let runName = $derived(generateJobRunName(jobName));

	function validateRunName(runName: string): { isValid: true } | { isValid: false; error: string } {
		const k8sNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
		const maxNameLength = 63;
		if (!runName) {
			return {
				isValid: false,
				error: 'Run name is required.'
			};
		} else if (!k8sNameRegex.test(runName)) {
			return {
				isValid: false,
				error:
					'Run name must be a valid Kubernetes resource name (lowercase alphanumeric and hyphens).'
			};
		} else if (runName.length > maxNameLength) {
			return {
				isValid: false,
				error: `Run name must not exceed ${maxNameLength} characters. Current length: ${runName.length}.`
			};
		} else {
			return {
				isValid: true
			};
		}
	}

	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const valid = validateRunName(runName);

		if (valid.isValid) {
			submit(runName);
			close();
		} else {
			error = valid.error;
		}
	};
</script>

<Modal open onclose={close} header="Trigger run" width="medium">
	<form method="dialog" id="trigger-run-form" onsubmit={onSubmit}>
		<BodyShort spacing>
			This will trigger a new run of
			<strong>{jobName}</strong> in
			<strong>{environment}</strong>.
		</BodyShort>
		<TextField
			type="text"
			bind:value={runName}
			{error}
			autofocus
			size="small"
			oninput={() => (error = '')}
		>
			{#snippet label()}
				Run name
			{/snippet}
			{#snippet description()}
				Auto-generated name (editable)
			{/snippet}
		</TextField>
	</form>
	{#snippet footer()}
		<Button form="trigger-run-form">Confirm</Button>
		<Button variant="secondary" type="button" onclick={close}>Cancel</Button>
	{/snippet}
</Modal>
