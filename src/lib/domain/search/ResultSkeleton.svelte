<script lang="ts">
	import { ShSkeleton } from '#lib/shadcn/ui/index.js';
</script>

<div class="skeleton">
	<ShSkeleton width="1.75rem" height="1.75rem" />
	<div class="skeleton-lines">
		<ShSkeleton width="14ch" height="0.875rem" />
		<ShSkeleton width="9ch" height="0.75rem" />
	</div>
</div>

<style>
	.skeleton {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-radius: calc(var(--radius) - 3px);
		padding: 0.5rem 0.625rem;
	}

	.skeleton-lines {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>
