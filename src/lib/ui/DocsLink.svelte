<script lang="ts">
	import { docURL } from '$lib/doc';
	import { Button, Tooltip } from '@nais/ds-svelte-community';
	import { BookIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		path: string;
	}

	let { path }: Props = $props();
</script>

<Tooltip placement="bottom" content="Documentation">
	<Button
		as="a"
		href={docURL(path)}
		target="_blank"
		rel="noopener noreferrer"
		variant="tertiary-neutral"
		size="small"
		icon={BookIcon}
	/>
</Tooltip>
