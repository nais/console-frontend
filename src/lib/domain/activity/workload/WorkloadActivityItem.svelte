<script lang="ts">
	import { fragment, type WorkloadActivityEntryFragment } from '$houdini';
	import ListItem from '$lib/ui/ListItem.svelte';
	import { Tooltip } from '@nais/ds-svelte-community';
	import { QuestionmarkIcon } from '@nais/ds-svelte-community/icons';

	import { icons } from '../activity-log-icons';
	import { activityTooltip } from '../activity-log-tooltip';
	import '../activity-log.css';
	import { workloadActivityEntryFragment } from './fragments';
	import WorkloadActivityText from './WorkloadActivityText.svelte';

	interface Props {
		item: WorkloadActivityEntryFragment;
	}

	let { item }: Props = $props();

	const data = $derived(fragment(item, workloadActivityEntryFragment));
	const Icon = $derived(icons[$data.__typename] || QuestionmarkIcon);
</script>

<ListItem>
	<div style="display: flex; gap: 0.5rem; min-width: 0;">
		<div class="activity-icon">
			<Tooltip content={activityTooltip($data.__typename)}>
				<Icon size="1em" width="1em" height="1em" />
			</Tooltip>
		</div>

		<div style="min-width: 0; overflow-wrap: anywhere;">
			<WorkloadActivityText data={$data} />
		</div>
	</div>
</ListItem>
