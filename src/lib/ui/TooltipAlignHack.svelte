<script lang="ts">
	import { Tooltip } from '@nais/ds-svelte-community';
	import type { TooltipProps } from '@nais/ds-svelte-community/components/Tooltip/type.js';

	const props: TooltipProps = $props();
</script>

<div style="display: contents; line-height: 0;">
	<Tooltip {...props} />
</div>
