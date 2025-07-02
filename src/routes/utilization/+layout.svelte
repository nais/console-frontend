<script lang="ts">
	import type { LayoutProps } from './$houdini';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><title>Tenant Utilization - Nais Console</title></svelte:head>

<div class="page">
	{@render children?.()}
</div>
