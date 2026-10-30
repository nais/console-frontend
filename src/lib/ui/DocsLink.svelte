<script lang="ts">
	import { docURL } from '#lib/doc.js';
	import { ShButton, Tooltip } from '#lib/shadcn/ui/index.js';

	import { BookIcon } from '#lib/icons/index.js';

	interface Props {
		path: string;
	}

	let { path }: Props = $props();
</script>

<Tooltip placement="bottom" content="Documentation">
	<ShButton
		href={docURL(path)}
		target="_blank"
		rel="noopener noreferrer"
		variant="ghost"
		size="icon-sm"
		icon={BookIcon}
		ariaLabel="Documentation"
	/>
</Tooltip>
