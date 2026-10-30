<script lang="ts">
	import { type AppInstanceGroups$result } from '$houdini';
	import { Badge } from '#lib/shadcn/ui/index.js';
	import CriticalIndicator from '#lib/ui/CriticalIndicator.svelte';
	import IncomingIndicator from '#lib/ui/IncomingIndicator.svelte';
	import RunningIndicator from '#lib/ui/RunningIndicator.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { formatImageVersion } from '#lib/utils/image.js';
	import { CloudSlashIcon } from '#lib/icons/index.js';
	import { slide } from 'svelte/transition';

	type InstanceGroups =
		AppInstanceGroups$result['team']['environment']['application']['instanceGroups'];

	interface Props {
		teamSlug: string;
		environmentName: string;
		appName: string;
		instanceGroups: AppInstanceGroups$result['team']['environment']['application']['instanceGroups'];
	}

	let { instanceGroups, teamSlug, environmentName, appName }: Props = $props();

	const incoming = $derived.by(() => {
		if (instanceGroups.length <= 1) {
			return null;
		}

		return instanceGroups.reduce((newest, group) =>
			new Date(group.created) > new Date(newest.created) ? group : newest
		);
	});

	function groupRole(group: InstanceGroups[0]) {
		if (incoming && group.id === incoming.id) return 'incoming';
		return 'current';
	}
</script>

<SurfaceCard title="Instance groups" eyebrow={false}>
	{#each instanceGroups as group (group.id)}
		{const role = $derived(groupRole(group))}
		{const hasFailing = $derived(
			group.instances.some((instance) => instance.status.state === 'FAILING')
		)}
		{const isUnhealthy = $derived(hasFailing || group.readyInstances < group.desiredInstances)}

		<a
			href="/team/{teamSlug}/{environmentName}/app/{appName}/instancegroup/{group.name}"
			class="instance-group-link"
			class:incoming={role === 'incoming'}
			transition:slide
		>
			<div class="instance-group-icon">
				{#if role === 'incoming'}
					<IncomingIndicator />
				{:else if isUnhealthy}
					<CriticalIndicator />
				{:else}
					<RunningIndicator />
				{/if}
			</div>
			<div class="instance-group-info">
				<span class="instance-group-status"
					>{group.readyInstances}/{group.desiredInstances} running</span
				>
				<span class="instance-group-meta">
					<code>{formatImageVersion(group.image)}</code> &middot; Updated
					<Time time={group.created} distance />
				</span>
			</div>
			<div class="instance-group-tags">
				{#if hasFailing}
					<Badge variant="destructive" dot>Failing</Badge>
				{/if}
				{#if incoming}
					{#if role === 'incoming'}
						<Badge variant="info" dot>Incoming</Badge>
					{:else}
						<Badge variant="secondary">Current</Badge>
					{/if}
				{/if}
			</div>
		</a>
	{:else}
		<div class="empty-state">
			<CloudSlashIcon />
			<span class="empty-title">No running instances</span>
			<span class="empty-description">This application has no active instance groups</span>
		</div>
	{/each}
</SurfaceCard>

<style>
	.instance-group-link {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.875rem;
		padding: 0.875rem 1rem;
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		background-color: color-mix(in srgb, var(--background) 60%, var(--card));
		border: 1px solid var(--border);
		transition:
			background-color 140ms ease,
			border-color 140ms ease,
			box-shadow 140ms ease,
			transform 140ms ease;
	}

	.instance-group-link:hover {
		background-color: var(--secondary);
		border-color: var(--border-strong);
		text-decoration: none;
	}

	.instance-group-link.incoming {
		border-style: dashed;
		border-color: var(--info-border);
	}

	.instance-group-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--surface-icon-size);
		height: var(--surface-icon-size);
		flex-shrink: 0;
		align-self: center;
	}

	.instance-group-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.instance-group-status {
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--foreground);
		font-variant-numeric: tabular-nums;
	}

	.instance-group-meta {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		overflow-wrap: anywhere;
	}

	.instance-group-meta code {
		font-family: monospace;
		font-size: 0.75rem;
		padding: 0.0625rem 0.375rem;
		border-radius: var(--radius-sm);
		background-color: var(--secondary);
		color: var(--foreground);
	}

	.instance-group-tags {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.375rem;
		justify-self: end;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.instance-group-link {
			grid-template-columns: auto 1fr;
			align-items: flex-start;
		}

		.instance-group-tags {
			grid-column: 2;
			justify-self: start;
			justify-content: flex-start;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 1rem;
		color: var(--muted-foreground);
	}

	.empty-state :global(svg) {
		width: 2.25rem;
		height: 2.25rem;
		opacity: 0.45;
	}

	.empty-title {
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--foreground);
	}

	.empty-description {
		font-size: 0.75rem;
	}
</style>
