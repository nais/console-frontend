<script lang="ts">
	import TooltipAlignHack from './TooltipAlignHack.svelte';

	type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

	let { label, tone }: { label: string; tone: Tone | null } = $props();
</script>

{#if tone}
	<TooltipAlignHack content={label}>
		<span class={['status-indicator', tone]} role="img" aria-label={label}></span>
	</TooltipAlignHack>
{/if}

<style>
	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		flex-shrink: 0;

		&::after {
			content: '';
			width: 10px;
			height: 10px;
			border-radius: 50%;
		}
	}

	.success::after {
		background-color: var(--ax-bg-success-strong);
	}

	.danger::after {
		background-color: var(--ax-bg-danger-strong);
	}

	.warning::after {
		background-color: var(--ax-bg-warning-moderate-pressed);
	}

	.info::after {
		background-color: var(--ax-bg-info-strong);
	}

	.neutral::after {
		background-color: var(--ax-text-neutral-decoration);
	}
</style>
