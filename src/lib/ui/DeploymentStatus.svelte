<script lang="ts">
	import { DeploymentStatusState, type DeploymentStatusState$options } from '$houdini';
	import Pill from '$lib/ui/Pill.svelte';
	import type { ComponentProps } from 'svelte';

	interface Props {
		status: DeploymentStatusState$options | 'UNKNOWN';
	}

	let { status }: Props = $props();

	let statusType: { variant: ComponentProps<typeof Pill>['variant']; title: string } = $derived.by(
		() => {
			switch (status) {
				case DeploymentStatusState.SUCCESS:
					return { variant: 'success', title: 'Success' };
				case DeploymentStatusState.IN_PROGRESS:
					return { variant: 'info', title: 'In progress' };
				case DeploymentStatusState.QUEUED:
					return { variant: 'neutral', title: 'Queued' };
				case DeploymentStatusState.FAILURE:
					return { variant: 'critical', title: 'Failed' };
				case DeploymentStatusState.ERROR:
					return { variant: 'critical', title: 'Error' };
				case DeploymentStatusState.INACTIVE:
					return { variant: 'neutral', title: 'Inactive' };
				case DeploymentStatusState.PENDING:
					return { variant: 'neutral', title: 'Pending' };
				default:
					return { variant: 'neutral', title: 'Unknown' };
			}
		}
	);
</script>

<Pill variant={statusType.variant}>{statusType.title}</Pill>
