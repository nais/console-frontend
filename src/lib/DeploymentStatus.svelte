<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';

	interface Props {
		status: string;
	}

	let { status }: Props = $props();

	const asdf = (
		status: string
	): { variant: 'success' | 'error' | 'neutral' | 'warning' | 'info'; title: string } => {
		switch (status) {
			case 'success':
				return { variant: 'success', title: 'Success' };
			case 'in_progress':
				return { variant: 'info', title: 'In progress' };
			case 'queued':
				return { variant: 'neutral', title: 'Queued' };
			case 'failure':
				return { variant: 'error', title: 'Failed' };
			default:
				return { variant: 'neutral', title: 'Unknown' };
		}
	};

	let statusType = $derived(asdf(status));
</script>

<Tag variant={statusType.variant} size="small"><span>{statusType.title}</span></Tag>

<style>
	span {
		white-space: nowrap;
	}
</style>
