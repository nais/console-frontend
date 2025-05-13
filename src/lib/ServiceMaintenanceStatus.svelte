<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';

	interface Props {
		status: boolean;
	}

	let { status }: Props = $props();

	let statusType: { variant: 'warning-moderate' | 'info-moderate'; title: string } = status
		? { variant: 'warning-moderate', title: 'DEADLINE' }
		: { variant: 'info-moderate', title: 'NO DEADLINE' };
</script>

<Tag variant={statusType.variant} size="small"><span>{statusType.title}</span></Tag>

<style>
	span {
		white-space: nowrap;
	}
</style>
