<script lang="ts">
	import { untrack } from 'svelte';
	import { cloneBaseline, type CloneSource } from './cloneConfiguration.js';
	import PostgresConfigurationFields from './PostgresConfigurationFields.svelte';
	import PostgresExtensionFields from './PostgresExtensionFields.svelte';
	import type { ResourceErrors, ResourceField } from './forms.js';
	import { BodyShort } from '#lib/shadcn/ui/index.js';

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
	// Expanded when there is something non-default to see: a draft that differs from the source or
	// a validation error, so errors are never hidden.
	const differs = untrack(
		() =>
			cpu !== baseline.cpu ||
			memory !== baseline.memory ||
			diskSize !== baseline.diskSize ||
			highAvailability !== baseline.highAvailability
	);
	// The user's own disclosure choice; initially open when there is a differing draft to show.
	let customizeChoice = $state(untrack(() => differs));
	// Validation errors force the disclosure open so they are never hidden.
	let hasErrors = $derived(Object.keys(errors ?? {}).length > 0);
	let customizeOpen = $derived(customizeChoice || hasErrors);
	let unset = $derived(
		(['cpu', 'memory', 'diskSize'] as ResourceField[]).filter((field) => !baseline[field])
	);
</script>

<BodyShort
	>Starts from the source's configuration (PostgreSQL {source.majorVersion}). Adjust to override.</BodyShort
>
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
	bind:customizeOpen={() => customizeOpen, (next) => (customizeChoice = next)}
/>
