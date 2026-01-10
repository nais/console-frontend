<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="page">
	<div class="container">
		{@render children()}
	</div>
</div>

<style>
	.page {
		width: 100%;
	}

	.container {
		max-width: 1440px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		margin-top: var(--spacing-layout);
	}
</style>
