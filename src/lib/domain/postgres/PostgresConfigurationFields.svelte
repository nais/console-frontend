<script lang="ts">
	import { tick } from 'svelte';
	import {
		configurationErrors,
		postgresResources,
		type ResourceErrors,
		type ResourceField
	} from './forms.js';
	import { BodyShort, Checkbox, Heading, ReadMore, TextField } from '@nais/ds-svelte-community';

	interface Props {
		cpu?: string | null;
		memory?: string | null;
		diskSize?: string | null;
		highAvailability?: boolean;
		editing?: boolean;
		errors?: ResourceErrors;
	}

	let {
		cpu = '',
		memory = '',
		diskSize = '',
		highAvailability = false,
		editing = false,
		errors = {}
	}: Props = $props();

	const defaults = {
		cpu: postgresResources.cpu.default,
		memory: postgresResources.memory.default,
		diskSize: postgresResources.diskSize.default
	};
	const uid = $props.id();
	let cpuValue = $derived(cpu ?? '');
	let memoryValue = $derived(memory ?? '');
	let diskSizeValue = $derived(diskSize ?? '');
	let customizeOpen = $derived(Boolean(cpu || memory || diskSize));
	let touched = $state<Partial<Record<ResourceField, boolean>>>({});
	let fieldErrors = $derived(
		configurationErrors({
			cpu: cpuValue,
			memory: memoryValue,
			diskSize: diskSizeValue
		})
	);

	function validateForm(element: HTMLElement) {
		const form = element.closest('form');
		if (!form) throw new Error('Postgres configuration fields require a form.');
		async function validate(event: SubmitEvent) {
			touched = { cpu: true, memory: true, diskSize: true };
			const firstInvalid = (['cpu', 'memory', 'diskSize'] as const).find(
				(field) => fieldErrors[field]
			);
			if (!firstInvalid) return;
			event.preventDefault();
			event.stopImmediatePropagation();
			customizeOpen = true;
			await tick();
			form?.querySelector<HTMLInputElement>(`input[name="${firstInvalid}"]`)?.focus();
		}
		form.addEventListener('submit', validate, true);
		return () => form.removeEventListener('submit', validate, true);
	}
</script>

{#snippet resourceFields()}
	<TextField
		name="cpu"
		label="CPU (cores)"
		inputmode="decimal"
		onblur={() => (touched.cpu = true)}
		error={touched.cpu || errors.cpu ? fieldErrors.cpu : undefined}
		placeholder={editing ? undefined : defaults.cpu}
		description={editing
			? `Maximum ${postgresResources.cpu.max} cores. Leave blank to keep the current value.`
			: `Maximum ${postgresResources.cpu.max} cores.`}
		bind:value={cpuValue}
	/>
	<TextField
		name="memory"
		label="Memory (GiB)"
		inputmode="decimal"
		onblur={() => (touched.memory = true)}
		error={touched.memory || errors.memory ? fieldErrors.memory : undefined}
		placeholder={editing ? undefined : defaults.memory}
		description={editing
			? `Maximum ${postgresResources.memory.max} GiB. Leave blank to keep the current value.`
			: `Maximum ${postgresResources.memory.max} GiB.`}
		bind:value={memoryValue}
	/>
	<TextField
		name="diskSize"
		label="Storage (GiB)"
		inputmode="numeric"
		onblur={() => (touched.diskSize = true)}
		error={touched.diskSize || errors.diskSize ? fieldErrors.diskSize : undefined}
		placeholder={editing ? undefined : defaults.diskSize}
		description={editing
			? `${postgresResources.diskSize.min}–${postgresResources.diskSize.max} GiB, whole numbers. Leave blank to keep the current value.`
			: `${postgresResources.diskSize.min}–${postgresResources.diskSize.max} GiB, whole numbers.`}
		bind:value={diskSizeValue}
	/>
{/snippet}

{#if editing}
	<div class="resource-fields" {@attach validateForm}>
		{@render resourceFields()}
	</div>
{:else}
	<section class="resources" aria-labelledby="{uid}-resources" {@attach validateForm}>
		<Heading as="h2" size="small" id="{uid}-resources">Resources</Heading>
		<dl class="resource-summary">
			<div>
				<dt>CPU (cores)</dt>
				<dd>{cpuValue || defaults.cpu}</dd>
			</div>
			<div>
				<dt>Memory (GiB)</dt>
				<dd>{memoryValue || defaults.memory}</dd>
			</div>
			<div>
				<dt>Storage (GiB)</dt>
				<dd>{diskSizeValue || defaults.diskSize}</dd>
			</div>
		</dl>
		<ReadMore header="Customize resources" size="small" bind:open={customizeOpen}>
			<div class="resource-fields">
				<BodyShort size="small">Leave blank to use platform defaults.</BodyShort>
				{@render resourceFields()}
			</div>
		</ReadMore>
	</section>
{/if}
<Checkbox
	name="highAvailability"
	checked={highAvailability}
	description="Add a third instance and enable synchronous replication."
>
	High availability
</Checkbox>

<style>
	.resources,
	.resource-fields {
		display: grid;
		gap: var(--ax-space-16);
	}

	.resources {
		padding: var(--ax-space-20);
		background: var(--ax-bg-neutral-soft);
		border-radius: var(--ax-radius-8);
	}

	.resource-summary {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--ax-space-16);
		margin: 0;
	}

	.resource-summary dt {
		font-size: var(--ax-font-size-small);
	}

	.resource-summary dd {
		margin: 0;
		font-size: var(--ax-font-size-xlarge);
		font-weight: var(--ax-font-weight-bold);
		overflow-wrap: anywhere;
	}
</style>
