<script>
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';

	const props = $props();
</script>

<ExclamationmarkTriangleFillIcon
	{...props}
	style="color:var(--ax-text-warning-decoration, --a-icon-warning);{props.style}"
/>
