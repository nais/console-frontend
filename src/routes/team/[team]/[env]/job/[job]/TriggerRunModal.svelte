<script lang="ts">
	import { BodyShort, Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';

	interface Props {
		jobName: string;
		environment: string;
		submit: (runName: string) => void;
		close: () => void;
	}
	let { jobName, environment, submit, close }: Props = $props();

	let error: string = $state('');

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
		const runName = (new FormData(e.target as HTMLFormElement).get('runName') ?? '') as string;
		const valid = validateRunName(runName);

		if (valid.isValid) {
			submit(runName);
			close();
		} else {
			error = valid.error;
		}
	};
</script>

<Modal open onclose={close} header="Trigger run">
	<form method="dialog" id="trigger-run-form" onsubmit={onSubmit} style="max-width: 512px">
		<BodyShort spacing>
			This will trigger a new run of
			<strong>{jobName}</strong> in
			<strong>{environment}</strong>.
		</BodyShort>
		<TextField type="text" name="runName" {error} autofocus>
			{#snippet label()}
				Run name
			{/snippet}
		</TextField>
	</form>
	{#snippet footer()}
		<Button form="trigger-run-form">Confirm</Button>
		<Button variant="secondary" type="button" onclick={close}>Cancel</Button>
	{/snippet}
</Modal>
