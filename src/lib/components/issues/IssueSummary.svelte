<script lang="ts">
	import { Heading, Loader } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		todo: number | undefined;
		warning: number | undefined;
		critical: number | undefined;
		teamSlug: string | undefined;
		loading: boolean;
	}

	let { todo, warning, critical, teamSlug, loading }: Props = $props();
</script>

<div class="issues">
	{#if !loading}
		<Heading level="2" size="small" spacing
			><a href="/team/{teamSlug}/issues">Health summary</a></Heading
		>
		{#if (critical ?? 0) > 0}
			<a href="/team/{teamSlug}/issues?severity=CRITICAL" class="summary critical">
				<div class="critical-icon pulse">
					<CircleFillIcon />
				</div>
				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(critical ?? 0) > 0 ? critical : 'No '}
					critical issue{(critical ?? 0) !== 1 ? 's' : ''}</span
				>
			</a>
		{/if}
		{#if (warning ?? 0) > 0}
			<a href="/team/{teamSlug}/issues?severity=WARNING" class="summary warning">
				<CircleFillIcon />
				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(warning ?? 0) > 0 ? warning : 'No'}
					warning{(warning ?? 0) !== 1 ? 's' : ''}</span
				>
			</a>
		{/if}
		{#if (todo ?? 0) > 0}
			<a href="/team/{teamSlug}/issues?severity=TODO" class="summary todo">
				<CircleFillIcon />

				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(todo ?? 0) > 0 ? todo : 'No'}
					todo{(todo ?? 0) !== 1 ? 's' : ''}</span
				>
			</a>
		{/if}
		{#if (critical ?? 0) == 0 && (warning ?? 0) == 0 && (todo ?? 0) == 0}
			<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold">
				No issues found
			</span>
		{/if}
	{:else}
		<div style="display: flex; justify-content: center; align-items: center; height: 290px;">
			<Loader size="3xlarge" />
		</div>
	{/if}
</div>

<style>
	.issues {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.summary {
		display: flex;
		align-items: center;
		gap: var(--ax-space-16);
		text-decoration: none;
		color: inherit;
	}

	.summary:hover {
		text-decoration: underline;
		text-decoration-color: var(--ax-text-neutral);
	}

	.todo {
		color: light-dark(var(--ax-bg-info-strong), var(--ax-bg-info-strong));
	}
	.warning {
		color: light-dark(var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed));
	}
	.critical {
		color: light-dark(var(--ax-bg-danger-strong), var(--ax-bg-danger-strong));
	}

	.critical-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pulse::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: currentColor;
		animation: pulse 2s infinite ease-in-out;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse::before {
			animation: none;
			display: none;
		}
	}
</style>
