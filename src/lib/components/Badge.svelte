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
			background-color: var(--a-surface-warning);
			color: var(--a-text-on-warning);
			border: 1px solid var(--a-border-warning);
		}

		&.badge--ERROR {
			background-color: var(--a-surface-danger);
			color: var(--a-text-on-danger);
			border: 1px solid var(--a-border-danger);
		}

		&.badge--TODO {
			background-color: var(--a-surface-info);
			color: var(--a-text-on-info);
			border: 1px solid var(--a-border-info);
		}

		&.badge--long {
			font-size: var(--a-font-size-medium);
		}
	}
</style>
