<script lang="ts">
	import { BodyShort, Button, Modal, TextField } from '@nais/ds-svelte-community';
	import { ArrowsCirclepathIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';

	interface Props {
		jobName: string;
		environment: string;
		submit: (runName: string) => void;
		close: () => void;
	}
	let { jobName, environment, submit, close }: Props = $props();

	let error: string = $state('');

	const generateRunName = (): string => {
		const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
		const sanitized = jobName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
		return `${sanitized}-${timestamp}`.slice(0, 63);
	};

	let runName = $state(generateRunName());

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

	const regenerate = () => {
		runName = generateRunName();
		error = '';
	};
</script>

<Modal open onclose={close} header="Trigger run" width="medium">
	<form method="dialog" id="trigger-run-form" onsubmit={onSubmit}>
		<BodyShort spacing>
			This will trigger a new run of
			<strong>{jobName}</strong> in
			<strong>{environment}</strong>.
		</BodyShort>
		<div class="name-input-wrapper">
			<div class="text-field-wrapper">
				<TextField type="text" bind:value={runName} {error} autofocus size="small">
					{#snippet label()}
						Run name
					{/snippet}
					{#snippet description()}
						Auto-generated name (editable)
					{/snippet}
				</TextField>
			</div>
			<Button
				type="button"
				variant="tertiary"
				size="small"
				icon={ArrowsCirclepathIcon}
				onclick={regenerate}
				title="Generate new name"
			>
				Regenerate
			</Button>
		</div>
	</form>
	{#snippet footer()}
		<Button form="trigger-run-form">Confirm</Button>
		<Button variant="secondary" type="button" onclick={close}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.name-input-wrapper {
		display: flex;
		gap: var(--ax-space-8);
		align-items: end;
	}

	.text-field-wrapper {
		flex: 1;
	}
</style>
