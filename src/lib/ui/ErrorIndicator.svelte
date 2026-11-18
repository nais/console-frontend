<script lang="ts">
	import { ExclamationmarkTriangleIcon } from '#lib/icons/index.js';

	let { label }: { label: string } = $props();
</script>

<span class="error-indicator" role="img" aria-label={label} title={label}>
	<ExclamationmarkTriangleIcon
		aria-hidden="true"
		style="width: var(--nais-space-16); height: var(--nais-space-16)"
	/>
</span>

<style>
	.error-indicator {
		display: inline-flex;
		align-items: center;
		color: var(--destructive);
	}
</style>
