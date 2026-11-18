<script lang="ts">
	import { untrack } from 'svelte';
	import { cloneBaseline, type CloneSource } from './cloneConfiguration.js';
	import PostgresConfigurationFields from './PostgresConfigurationFields.svelte';
	import PostgresExtensionFields from './PostgresExtensionFields.svelte';
	import type { ResourceErrors, ResourceField } from './forms.js';
	import { BodyShort, Select } from '#lib/shadcn/ui/index.js';

	interface Props {
		source: CloneSource;
		/** Extensions that can be added in the selected environment. */
		availableExtensions?: readonly string[];
		/** Values of a failed submission for this same source, if any. */
		draft?: {
			cpu?: string;
			memory?: string;
			diskSize?: string;
			highAvailability?: boolean;
			extensions?: readonly string[];
		} | null;
		errors?: ResourceErrors;
	}

	let { source, availableExtensions = [], draft = null, errors }: Props = $props();

	// The parent keys this component by source, so these start over whenever the source changes.
	const baseline = untrack(() => cloneBaseline(source));
	let cpu = $state(untrack(() => draft?.cpu ?? baseline.cpu));
	let memory = $state(untrack(() => draft?.memory ?? baseline.memory));
	let diskSize = $state(untrack(() => draft?.diskSize ?? baseline.diskSize));
	let highAvailability = $state(
		untrack(() => draft?.highAvailability ?? baseline.highAvailability)
	);
	let unset = $derived(
		(['cpu', 'memory', 'diskSize'] as ResourceField[]).filter((field) => !baseline[field])
	);
</script>

<BodyShort>Starts from the source's configuration. Adjust to override.</BodyShort>
<input type="hidden" name="majorVersion" value={source.majorVersion} />
<Select
	label="PostgreSQL version"
	disabled
	value={source.majorVersion}
	description="Must match the source."
>
	<option value={source.majorVersion}>{source.majorVersion}</option>
</Select>
<PostgresExtensionFields
	available={availableExtensions}
	locked={baseline.extensions}
	selected={draft?.extensions ?? baseline.extensions}
/>
<PostgresConfigurationFields
	{errors}
	inherit={{ diskSizeMin: baseline.diskSizeMin, unset }}
	bind:cpu
	bind:memory
	bind:diskSize
	bind:highAvailability
/>
