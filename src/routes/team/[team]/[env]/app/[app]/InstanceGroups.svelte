<script lang="ts">
	import type { AppInstanceGroups$result, ApplicationRolloutStuckReason$options } from '$houdini';
	import { CloudSlashIcon } from '#lib/icons/index.js';
	import {
		countReadyInstances,
		summarizeUnreadyInstances
	} from '#lib/domain/workload/applicationReadiness.js';
	import { Alert, Badge, Heading, Loader, StatusIndicator, Tag } from '#lib/shadcn/ui/index.js';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { formatImageVersion } from '#lib/utils/image.js';
	import { slide } from 'svelte/transition';

	type InstanceGroups =
		AppInstanceGroups$result['team']['environment']['application']['instanceGroups'];

	interface Props {
		teamSlug: string;
		environmentName: string;
		appName: string;
		instanceGroups: InstanceGroups;
		readyInstances: number;
		rolloutIssue?: { reason: ApplicationRolloutStuckReason$options; message: string };
	}

	let { instanceGroups, teamSlug, environmentName, appName, readyInstances, rolloutIssue }: Props =
		$props();

	const appPath = $derived(`/team/${teamSlug}/${environmentName}/app/${appName}`);

	const incoming = $derived.by(() => {
		if (instanceGroups.length <= 1 || rolloutIssue?.reason === 'INSTANCE_CREATION_FAILED') {
			return null;
		}

		return instanceGroups.reduce((newest, group) =>
			group.created > newest.created ? group : newest
		);
	});

	const onlyGroup = $derived(instanceGroups.length === 1 ? instanceGroups[0] : undefined);

	const rolloutTitle: Record<ApplicationRolloutStuckReason$options, string> = {
		INSTANCE_CREATION_FAILED: 'Instances could not be created',
		TIMED_OUT: 'New version did not become ready in time'
	};
</script>

{#if rolloutIssue}
	<Alert variant="warning" size="small">
		<div class="rollout-notice">
			<Heading as="h2" size="small">
				Rollout stuck{rolloutTitle[rolloutIssue.reason]
					? `: ${rolloutTitle[rolloutIssue.reason]}`
					: ''}
			</Heading>
			<p>{rolloutIssue.message}</p>
			{#if readyInstances > 0}
				<p>
					{readyInstances === 1
						? '1 instance is still ready to receive traffic.'
						: `${readyInstances} instances are still ready to receive traffic.`}
				</p>
			{/if}
			{#if incoming && incoming.instances.length === 0}
				<p>There are no instances to inspect in the incoming group.</p>
			{/if}
			<div class="rollout-links">
				{#if incoming?.instances.length}
					<a href="{appPath}/instancegroup/{incoming.name}">Inspect incoming instances</a>
				{:else if rolloutIssue.reason !== 'INSTANCE_CREATION_FAILED' && onlyGroup?.instances.some((instance) => !instance.status.ready)}
					<a href="{appPath}/instancegroup/{onlyGroup.name}">Inspect available instances</a>
				{/if}
				<a href="{appPath}/events">View workload events</a>
			</div>
		</div>
	</Alert>
{/if}

<SurfaceCard title="Instance groups" eyebrow={false}>
	{#each instanceGroups as group (group.id)}
		{const isIncoming = $derived(group.id === incoming?.id)}
		{const isStuck = $derived(isIncoming && Boolean(rolloutIssue))}
		{const ready = $derived(countReadyInstances(group.instances))}
		{const unready = $derived(summarizeUnreadyInstances(group.instances))}
		{const isUnhealthy = $derived(ready < group.desiredInstances || unready.size > 0)}

		<a
			href="{appPath}/instancegroup/{group.name}"
			class={['instance-group-link', { incoming: isIncoming && !isStuck, stuck: isStuck }]}
			transition:slide
		>
			<div class="instance-group-icon">
				{#if isIncoming && !isStuck && !isUnhealthy}
					<Loader size="xsmall" title="Incoming instance group" />
				{:else}
					<StatusIndicator tone={isStuck || isUnhealthy ? 'warning' : 'success'} />
				{/if}
			</div>
			<div class="instance-group-info">
				<div class="instance-group-heading">
					<span class="instance-group-status">{ready}/{group.desiredInstances} ready</span>
					{#if isStuck}
						<Badge variant="warning">Rollout stuck</Badge>
					{:else if isIncoming}
						<Badge variant="info">Incoming</Badge>
					{:else if incoming}
						<Badge variant="secondary">Previous</Badge>
					{/if}
				</div>
				<span class="instance-group-meta">
					<code>{formatImageVersion(group.image)}</code> &middot; Updated
					<Time time={group.created} distance />
				</span>
				{#if unready.size}
					<ul class="instance-problems" role="list">
						{#each unready as [key, status] (key)}
							<li>
								<Tag size="small" variant={status.variant}>{status.count} · {status.label}</Tag>
								{#if status.message}<span>{status.message}</span>{/if}
							</li>
						{/each}
					</ul>
				{:else if group.desiredInstances > 0 && !group.instances.length}
					<span class="instance-group-meta">No instances in this group.</span>
				{/if}
			</div>
		</a>
	{:else}
		<div class="empty-state">
			<CloudSlashIcon />
			<span class="empty-title">No active instance groups</span>
			<span class="empty-description">There are no instances to inspect for this application.</span>
		</div>
	{/each}
</SurfaceCard>

<style>
	.rollout-notice {
		display: grid;
		gap: var(--nais-space-4);
	}

	.rollout-notice p {
		margin: 0;
	}

	.rollout-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--nais-space-4) var(--nais-space-16);
		margin-block-start: var(--nais-space-4);
	}

	.instance-group-link {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--nais-space-14);
		padding: var(--nais-space-14) var(--nais-space-16);
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

	.instance-group-link.stuck {
		border-color: var(--warning-border);
	}

	.instance-problems {
		display: grid;
		gap: var(--nais-space-8);
		list-style: none;
		margin: var(--nais-space-6) 0 0;
		padding: 0;
		font-size: var(--sh-font-size-sm);
		color: var(--muted-foreground);
		overflow-wrap: anywhere;
	}

	.instance-problems li {
		display: grid;
		justify-items: start;
		gap: var(--nais-space-2);
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
		gap: var(--nais-space-4);
		flex: 1;
		min-width: 0;
	}

	.instance-group-heading {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--nais-space-4) var(--nais-space-8);
	}

	.instance-group-status {
		font-weight: 600;
		font-size: var(--sh-font-size-sm);
		color: var(--foreground);
		font-variant-numeric: tabular-nums;
	}

	.instance-group-meta {
		font-size: var(--sh-font-size-sm);
		color: var(--muted-foreground);
		overflow-wrap: anywhere;
	}

	.instance-group-meta code {
		font-family: monospace;
		font-size: var(--sh-font-size-xs);
		padding: var(--nais-space-1) var(--nais-space-6);
		border-radius: var(--radius-sm);
		background-color: var(--secondary);
		color: var(--foreground);
	}

	@media (max-width: 767px), (max-height: 500px) {
		.instance-group-link {
			gap: var(--nais-space-8);
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--nais-space-8);
		padding: var(--nais-space-24) var(--nais-space-16);
		color: var(--muted-foreground);
	}

	.empty-state :global(svg) {
		width: var(--nais-space-36);
		height: var(--nais-space-36);
		opacity: 0.45;
	}

	.empty-title {
		font-weight: 600;
		font-size: var(--sh-font-size-sm);
		color: var(--foreground);
	}

	.empty-description {
		font-size: var(--sh-font-size-sm);
	}
</style>
