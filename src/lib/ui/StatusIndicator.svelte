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
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;

		&::after {
			content: '';
			width: 0.55rem;
			height: 0.55rem;
			border-radius: 9999px;
			transition: box-shadow 150ms ease;
		}
	}

	.success::after {
		background-color: var(--success);
		box-shadow: 0 0 0 3px var(--success-muted);
	}

	.danger::after {
		background-color: var(--destructive);
		box-shadow: 0 0 0 3px var(--destructive-muted);
	}

	.warning::after {
		background-color: var(--warning);
		box-shadow: 0 0 0 3px var(--warning-muted);
	}

	.info::after {
		background-color: var(--info);
		box-shadow: 0 0 0 3px var(--info-muted);
	}

	.neutral::after {
		background-color: var(--muted-foreground);
		box-shadow: 0 0 0 3px var(--secondary);
	}
</style>
