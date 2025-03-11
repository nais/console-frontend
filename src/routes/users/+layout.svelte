<script lang="ts">
	import type { LayoutProps } from './$houdini';

	let { children }: LayoutProps = $props();
</script>

<div class="page">
	{@render children?.()}
</div>
