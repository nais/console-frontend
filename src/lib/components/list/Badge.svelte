<script module lang="ts">
	export const badgeLevel = (
		errors: { level: WorkloadStatusErrorLevel$options }[]
	): WorkloadStatusErrorLevel$options => {
		if (errors.some((error) => error.level === 'ERROR')) {
			return 'ERROR';
		} else if (errors.some((error) => error.level === 'WARNING')) {
			return 'WARNING';
		} else {
			return 'TODO';
		}
	};
</script>

<script lang="ts">
	import { type WorkloadStatusErrorLevel$options } from '$houdini';

	export type BadgeProps = {
		count: number;
		level: WorkloadStatusErrorLevel$options;
	};

	const { count, level }: BadgeProps = $props();
</script>

{#if count}
	<div class={['badge', `badge--${level}`, { 'badge--long': `${count}`.length > 2 }]}>
		{count}
	</div>
{/if}

<style>
	.badge {
		height: 2rem;
		width: 2rem;
		border-radius: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		&.badge--WARNING {
			background-color: var(--ax-bg-warning-moderate);
			color: var(--ax-text-neutral);
			border: 1px solid var(--ax-border-warning);
		}

		&.badge--ERROR {
			background-color: var(--ax-bg-danger-moderate);
			color: var(--ax-text-neutral);
			border: 1px solid var(--ax-border-danger);
		}

		&.badge--TODO {
			background-color: var(--ax-bg-info-moderate);
			color: var(--ax-text-neutral);
			border: 1px solid var(--ax-border-info);
		}

		&.badge--long {
			font-size: var(--ax-font-size-medium);
		}
	}
</style>
