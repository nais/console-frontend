<script lang="ts">
	import { DeploymentStatusState } from '$lib/urql/gql/graphql';
	import { Tag } from '@nais/ds-svelte-community';
	import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

	interface Props {
		status: DeploymentStatusState | `${DeploymentStatusState}` | 'UNKNOWN';
	}

	let { status }: Props = $props();

	let statusType: { variant: TagProps['variant']; title: string } = $derived.by(() => {
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
	});
</script>

<Tag variant={statusType.variant} size="small"><span>{statusType.title}</span></Tag>

<style>
	span {
		white-space: nowrap;
	}
</style>
