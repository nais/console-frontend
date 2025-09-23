<script lang="ts">
	import { page } from '$app/state';
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

<div
	class="card issues {(critical ?? 0) > 0
		? 'card-critical'
		: (warning ?? 0) > 0
			? 'card-warning'
			: (todo ?? 0) > 0
				? 'card-todo'
				: ''}"
>
	{#if !loading}
		<Heading level="3" size="medium" spacing>Health summary</Heading>
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
	{#if !page.url.pathname.includes('/issues')}
		<a href="/team/{teamSlug}/issues" style:align-self="end">View All Issues for Team</a>
	{/if}
</div>

<style>
	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
	}

	.issues {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		padding-bottom: var(--ax-space-32);
	}

	.summary {
		display: flex;
		align-items: center;
		gap: var(--ax-space-16);
	}

	.card-todo {
		border: 1px solid var(--ax-border-info-strong);
		background-color: var(--ax-bg-info-soft);
	}

	.card-warning {
		border: 1px solid var(--ax-border-warning);
		background-color: var(--ax-bg-warning-soft);
	}

	.card-critical {
		border: 1px solid var(--ax-border-danger);
		background-color: var(--ax-bg-danger-soft);
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
