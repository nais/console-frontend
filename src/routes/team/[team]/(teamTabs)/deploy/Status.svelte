<script lang="ts">
	import { Tag } from '@nais/ds-svelte';
	export let status: string;
	let asdf = (
		status: string
	): { variant: 'success' | 'error' | 'neutral' | 'warning'; title: string } => {
		switch (status) {
			case 'success':
				return { variant: 'success', title: 'Success' };
			case 'in_progress':
				return { variant: 'warning', title: 'In progress' };
			case 'failure':
				return { variant: 'error', title: 'Failed' };
			default:
				return { variant: 'neutral', title: 'Unknown' };
		}
	};
	$: statusType = asdf(status);
</script>

<Tag variant={statusType.variant} size="small"><span>{statusType.title}</span></Tag>

<style>
	span {
		white-space: nowrap;
	}
</style>
