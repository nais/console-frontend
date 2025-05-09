<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';
	import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

	interface Props {
		status: 'DEADLINE' | 'NO_DEADLINE';
	}

	let { status }: Props = $props();

	let statusType: { variant: TagProps['variant']; title: string } = $derived.by(() => {
		switch (status) {
			case 'DEADLINE':
				return { variant: 'warning-moderate', title: 'DEADLINE' };
			case 'NO_DEADLINE':
				return { variant: 'info-moderate', title: 'NO DEADLINE' };
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
