<script>
	import { CheckmarkCircleFillIcon } from '@nais/ds-svelte-community/icons';

	const props = $props();
</script>

<CheckmarkCircleFillIcon {...props} style="color:var(--ax-text-success-decoration);{props.style}" />
