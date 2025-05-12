<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';
	import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

	interface Props {
		status: boolean
	}

	let { status }: Props = $props()

        let statusType = status ? { variant: 'warning-moderate', title: 'DEADLINE' } : { variant: 'info-moderate', title: 'NO DEADLINE' }

</script>

<Tag variant={statusType.variant} size="small"><span>{statusType.title}</span></Tag>

<style>
	span {
		white-space: nowrap;
	}
</style>
