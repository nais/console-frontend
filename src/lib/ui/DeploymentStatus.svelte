<script lang="ts">
	import { DeploymentStatusState, type DeploymentStatusState$options } from '$houdini';
	import { Tag } from '@nais/ds-svelte-community';
	import type { ComponentProps } from 'svelte';

	interface Props {
		status: DeploymentStatusState$options | 'UNKNOWN';
	}

	let { status }: Props = $props();

	let statusType: { variant: ComponentProps<typeof Tag>['variant']; title: string } = $derived.by(
		() => {
			switch (status) {
				case DeploymentStatusState.SUCCESS:
					return { variant: 'success', title: 'Success' };
				case DeploymentStatusState.IN_PROGRESS:
					return { variant: 'info', title: 'In progress' };
				case DeploymentStatusState.QUEUED:
					return { variant: 'neutral', title: 'Queued' };
				case DeploymentStatusState.FAILURE:
					return { variant: 'error', title: 'Failed' };
				case DeploymentStatusState.ERROR:
					return { variant: 'error', title: 'Error' };
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

<Tag size="xsmall" variant={statusType.variant}>{statusType.title}</Tag>
