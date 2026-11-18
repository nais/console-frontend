<script lang="ts">
	import TooltipAlignHack from './TooltipAlignHack.svelte';

	type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

	let {
		label,
		tone,
		compact = false
	}: { label?: string; tone: Tone | null; compact?: boolean } = $props();
</script>

{#snippet indicator()}
	<span
		class={['status-indicator', tone, { compact }]}
		role={label ? 'img' : undefined}
		aria-label={label}
		aria-hidden={label ? undefined : true}
	></span>
{/snippet}

{#if tone}
	{#if label}
		<TooltipAlignHack content={label}>
			{@render indicator()}
		</TooltipAlignHack>
	{:else}
		{@render indicator()}
	{/if}
{/if}

<style>
	.status-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--nais-space-24);
		height: var(--nais-space-24);
		flex-shrink: 0;

		&::after {
			content: '';
			width: var(--nais-space-8);
			height: var(--nais-space-8);
			border-radius: var(--radius-full);
		}
	}

	.compact {
		width: var(--nais-space-8);
		height: var(--nais-space-8);
	}

	.success::after {
		background-color: var(--success);
		box-shadow: 0 0 0 var(--nais-space-2) var(--success-muted);
	}

	.danger::after {
		background-color: var(--destructive);
		box-shadow: 0 0 0 var(--nais-space-2) var(--destructive-muted);
	}

	.warning::after {
		background-color: var(--warning);
		box-shadow: 0 0 0 var(--nais-space-2) var(--warning-muted);
	}

	.info::after {
		background-color: var(--info);
		box-shadow: 0 0 0 var(--nais-space-2) var(--info-muted);
	}

	.neutral::after {
		background-color: var(--muted-foreground);
		box-shadow: 0 0 0 var(--nais-space-2) var(--secondary);
	}
</style>
