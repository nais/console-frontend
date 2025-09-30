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

<div class="card issues">
	<Heading level="2" size="small"><a href="/team/{teamSlug}/issues">Health</a></Heading>
	{#if !loading}
		{#if (critical ?? 0) > 0}
			<div class="summary critical">
				<CircleFillIcon />
				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(critical ?? 0) > 0 ? critical : 'No '}
					critical issue{(critical ?? 0) !== 1 ? 's' : ''}</span
				>
			</div>
		{/if}
		{#if (warning ?? 0) > 0}
			<div class="summary warning">
				<CircleFillIcon />
				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(warning ?? 0) > 0 ? warning : 'No'}
					warning{(warning ?? 0) !== 1 ? 's' : ''}</span
				>
			</div>
		{/if}
		{#if (todo ?? 0) > 0}
			<div class="summary todo">
				<CircleFillIcon />

				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(todo ?? 0) > 0 ? todo : 'No'}
					todo{(todo ?? 0) !== 1 ? 's' : ''}</span
				>
			</div>
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
	.card {
		/* padding: var(--ax-space-16) var(--ax-space-20); */
		align-items: stretch;
	}

	.issues {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding-bottom: var(--ax-space-32);
	}

	.summary {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
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
</style>
