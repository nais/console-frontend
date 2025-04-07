<script>
	import { BodyShort, Detail, Skeleton } from '@nais/ds-svelte-community';
</script>

<div class="skeleton">
	<Skeleton variant="circle" height="20px" width="20px" />
	<div>
		<Skeleton variant="text">
			<BodyShort>watsons-brother</BodyShort>
		</Skeleton>
		<Skeleton variant="text">
			<Detail>ibm / dev</Detail>
		</Skeleton>
	</div>
</div>

<style>
	.skeleton {
		display: flex;
		align-items: center;
		gap: var(--ax-space-6, --a-spacing-1-alt);
		border-radius: 4px;
		padding: var(--ax-space-4, --a-spacing-1);
	}
</style>
