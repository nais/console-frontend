<script lang="ts">
	import { Checkbox, TextField } from '@nais/ds-svelte-community';

	interface Props {
		cpu?: string | null;
		memory?: string | null;
		diskSize?: string | null;
		highAvailability?: boolean;
		editing?: boolean;
	}

	let {
		cpu = '',
		memory = '',
		diskSize = '',
		highAvailability = false,
		editing = false
	}: Props = $props();
</script>

<TextField
	name="cpu"
	label="CPU"
	description={editing
		? 'For example 100m or 1. Leave blank to keep the current value.'
		: 'For example 100m or 1. Leave blank to use the platform default.'}
	value={cpu ?? ''}
/>
<TextField
	name="memory"
	label="Memory"
	description={editing
		? 'For example 512Mi or 1Gi. Leave blank to keep the current value.'
		: 'For example 512Mi or 1Gi. Leave blank to use the platform default.'}
	value={memory ?? ''}
/>
<TextField
	name="diskSize"
	label="Storage"
	description={editing
		? 'For example 10Gi. Leave blank to keep the current value.'
		: 'For example 10Gi. Leave blank to use the platform default.'}
	value={diskSize ?? ''}
/>
<Checkbox
	name="highAvailability"
	checked={highAvailability}
	description="Add a third instance and enable synchronous replication."
>
	High availability
</Checkbox>
