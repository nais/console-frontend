<script lang="ts">
	import { ShSkeleton } from '#lib/shadcn/ui/index.js';
</script>

<div class="skeleton">
	<ShSkeleton width="var(--nais-space-28)" height="var(--nais-space-28)" />
	<div class="skeleton-lines">
		<ShSkeleton width="14ch" height="var(--nais-space-14)" />
		<ShSkeleton width="9ch" height="var(--nais-space-12)" />
	</div>
</div>

<style>
	.skeleton {
		display: flex;
		align-items: center;
		gap: var(--nais-space-12);
		border-radius: var(--radius-xs);
		padding: var(--nais-space-8) var(--nais-space-10);
	}

	.skeleton-lines {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-4);
	}
</style>
