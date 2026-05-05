<script lang="ts">
	import { type App$result } from '$houdini';
	import IncomingIndicator from '$lib/ui/IncomingIndicator.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Tag } from '@nais/ds-svelte-community';
	import { CloudSlashIcon } from '@nais/ds-svelte-community/icons';

	type TeamData = NonNullable<App$result['team']>;
	type EnvironmentData = NonNullable<TeamData['environment']>;
	type AppData = NonNullable<EnvironmentData['application']>;
	type InstanceGroup = AppData['instanceGroups'][number];

	interface Props {
		app: AppData;
	}

	let { app }: Props = $props();

	const incoming = $derived.by(() => {
		if (app.instanceGroups.length <= 1) {
			return null;
		}

		return app.instanceGroups.reduce((newest, group) =>
			new Date(group.created) > new Date(newest.created) ? group : newest
		);
	});

	function groupRole(group: InstanceGroup) {
		if (incoming && group.id === incoming.id) return 'incoming';
		return 'current';
	}
</script>

<SurfaceCard title="Instance groups" reverseGradient>
	{#each app.instanceGroups as group (group.id)}
		{@const role = groupRole(group)}
		{@const hasFailing = group.instances.some((instance) => instance.status.state === 'FAILING')}

		<a
			href="/team/{app.team.slug}/{app.teamEnvironment.environment
				.name}/app/{app.name}/instancegroup/{group.name}"
			class="instance-group-link"
			class:incoming={role === 'incoming'}
		>
			<div class="instance-group-icon">
				{#if role === 'incoming'}
					<IncomingIndicator />
				{:else}
					<RunningIndicator />
				{/if}
			</div>
			<div class="instance-group-info">
				<span class="instance-group-status"
					>{group.readyInstances}/{group.desiredInstances} running</span
				>
				<span class="instance-group-meta">
					{group.image.tag} &middot; Updated <Time time={group.created} distance />
				</span>
			</div>
			<div class="instance-group-tags">
				{#if hasFailing}
					<Tag size="small" variant="error">Failing</Tag>
				{/if}
				{#if incoming}
					{#if role === 'incoming'}
						<Tag size="small" variant="alt1">Incoming</Tag>
					{:else}
						<Tag size="small" variant="neutral">Current</Tag>
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
		gap: var(--ax-space-12);
		padding: var(--ax-space-12);
		border-radius: var(--ax-radius-8);
		text-decoration: none;
		color: inherit;
		background: color-mix(in srgb, var(--ax-bg-default) 82%, transparent);
		box-shadow: 0 0 0 1px var(--ax-border-neutral-subtleA);
		transition:
			background-color 120ms ease,
			box-shadow 120ms ease,
			transform 120ms ease;
	}

	.instance-group-link:hover {
		background: color-mix(in srgb, var(--surface-icon-color) 8%, var(--ax-bg-default));
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--surface-icon-color) 24%, transparent),
			0 8px 12px -10px var(--surface-shadow-color);
		transform: translateY(-1px);
	}

	.instance-group-link.incoming {
		border: 1px dashed var(--ax-border-neutral-subtle);
		box-shadow: none;
	}

	.instance-group-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--surface-icon-size);
		height: var(--surface-icon-size);
		flex-shrink: 0;
		align-self: start;
	}

	.instance-group-info {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
		flex: 1;
		min-width: 0;
	}

	.instance-group-status {
		font-weight: var(--ax-font-weight-bold);
	}

	.instance-group-meta {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
		overflow-wrap: anywhere;
	}

	.instance-group-tags {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--ax-space-8);
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

		:global(.header button) {
			width: 100%;
		}

		:global(.header) {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--ax-space-12);
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ax-space-8);
		padding-bottom: var(--ax-space-24);
		color: var(--ax-text-subtle);
	}

	.empty-state :global(svg) {
		width: 2.5rem;
		height: 2.5rem;
		opacity: 0.4;
	}

	.empty-title {
		font-weight: var(--ax-font-weight-bold);
		font-size: var(--ax-font-size-medium);
		color: var(--ax-text-neutral);
	}

	.empty-description {
		font-size: var(--ax-font-size-small);
	}
</style>
