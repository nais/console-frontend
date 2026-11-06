<script lang="ts">
	import { ShSkeleton } from '#lib/shadcn/ui/index.js';
</script>

<div class="skeleton">
	<ShSkeleton width="var(--ax-space-28)" height="var(--ax-space-28)" />
	<div class="skeleton-lines">
		<ShSkeleton width="14ch" height="var(--ax-space-14)" />
		<ShSkeleton width="9ch" height="var(--ax-space-12)" />
	</div>
</div>

<style>
	.skeleton {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		border-radius: var(--radius-xs);
		padding: var(--ax-space-8) var(--ax-space-10);
	}

	.skeleton-lines {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}
</style>
