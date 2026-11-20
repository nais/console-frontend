<script lang="ts">
	import type { WorkloadEventsFields$data, WorkloadWarningEventKind$options } from '$houdini';
	import { isSameSecond, isSameYear } from 'date-fns';
	import {
		ArrowsUpDownIcon,
		ArrowCirclepathIcon,
		ExclamationmarkTriangleIcon
	} from '#lib/icons/index.js';
	import { ShAlert, ShBadge, ShSpinner } from '#lib/shadcn/ui/index.js';
	import Time from '#lib/ui/Time.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';

	interface Props {
		events: WorkloadEventsFields$data | null | undefined;
		fetching?: boolean;
		failed?: boolean;
		compact?: boolean;
	}

	let { events, fetching = false, failed = false, compact = false }: Props = $props();
	const entries = $derived(
		exhaustive(events?.nodes ?? []).map((event) => ({
			event,
			seenFormat:
				event.__typename === 'WorkloadWarningEvent'
					? warningSeenFormat(event.firstSeenAt, event.triggeredAt)
					: null
		}))
	);

	function warningSeenFormat(first: Date, last: Date) {
		if (first.getTime() === last.getTime()) return null;

		const day = isSameYear(first, last) ? 'd MMM' : 'd MMM yyyy';
		const clock = isSameSecond(first, last) ? 'HH:mm:ss.SSS' : 'HH:mm:ss';
		return `${day}, ${clock}`;
	}

	const warningLabels: Record<WorkloadWarningEventKind$options, string> = {
		PLACEMENT_FAILED: 'Placement failed',
		MOUNT_FAILED: 'Mount failed',
		IMAGE_PULL_FAILED: 'Image pull failed',
		START_FAILED: 'Start failed',
		CRASH_LOOP: 'Crash loop',
		HEALTH_CHECK_FAILED: 'Health check failed',
		INSTANCE_STOPPED: 'Instance stopped',
		INSTANCE_CREATION_FAILED: 'Instance creation failed',
		SCALING_FAILED: 'Automatic scaling failed',
		RUN_FAILED: 'Job run failed'
	};
</script>

{#if failed}
	<div class={{ 'history-state': !compact }}>
		<ShAlert variant="destructive" size="sm">Could not load workload events.</ShAlert>
	</div>
{/if}

{#if entries.length > 0}
	<ol class={['timeline', { compact }]} role="list">
		{#each entries as { event, seenFormat } (event.id)}
			<li class="event">
				<div
					class={['surface-icon', { warning: event.__typename === 'WorkloadWarningEvent' }]}
					aria-hidden="true"
				>
					{#if event.__typename === 'WorkloadWarningEvent'}
						<ExclamationmarkTriangleIcon />
					{:else if event.__typename === 'WorkloadKillingEvent'}
						<ArrowCirclepathIcon />
					{:else}
						<ArrowsUpDownIcon />
					{/if}
				</div>
				<div class="event-details">
					<div class="event-heading">
						<p class="event-title">
							{#if event.__typename === 'WorkloadWarningEvent'}
								{warningLabels[event.kind] ?? 'Workload warning'}
							{:else if event.__typename === 'WorkloadKillingEvent'}
								Container restart
							{:else}
								Automatic rescale
							{/if}
						</p>
						<div class="event-meta event-timestamp">
							{#if event.__typename === 'WorkloadWarningEvent'}
								<span class="sr-only">{seenFormat ? 'Last seen' : 'Seen'}</span>
							{/if}
							<Time time={event.triggeredAt} dateFormat={seenFormat ?? 'd MMM, HH:mm:ss'} />
						</div>
					</div>
					{#if !compact || event.__typename !== 'WorkloadKillingEvent' || event.message.trim() !== 'Instance restarted'}
						<p class="event-message">{event.message}</p>
					{/if}
					{#if event.__typename === 'WorkloadWarningEvent' && (seenFormat || event.count > 1 || event.instance)}
						<div class="event-meta">
							{#if seenFormat}
								<span class="event-time">
									First seen <Time time={event.firstSeenAt} dateFormat={seenFormat} />
								</span>
							{/if}
							{#if event.count > 1}
								<span aria-hidden="true">
									<ShBadge variant="warning" size="xs">{event.count}&times;</ShBadge>
								</span>
								<span class="sr-only">{event.count} occurrences</span>
							{/if}
							{#if event.instance}
								<span class="event-instance">
									Instance:
									<code>{event.instance}</code>
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
{:else if fetching && !failed}
	<div class={{ 'history-state': !compact }} role="status" aria-label="Loading workload events">
		<ShSpinner size="sm" />
	</div>
{:else if !failed}
	<p class={['event-meta', { 'history-state': !compact }]}>No recent events</p>
{/if}

<style>
	.timeline {
		--surface-icon-size: var(--nais-space-28);
		--surface-icon-glyph-size: var(--nais-space-16);
		display: flex;
		flex-direction: column;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.event {
		display: flex;
		gap: var(--nais-space-12);
		padding: var(--nais-space-10) var(--nais-space-16);
	}

	.compact {
		--surface-icon-size: var(--nais-space-24);
		--surface-icon-glyph-size: var(--nais-space-14);
	}

	.compact .event {
		gap: var(--nais-space-8);
		padding-block: var(--nais-space-6);
		padding-inline: 0;
	}

	.event + .event {
		border-block-start: var(--sh-border-width) solid var(--border);
	}

	.surface-icon {
		color: var(--muted-foreground);
		background: var(--secondary);
	}

	.surface-icon.warning {
		color: var(--warning);
		background: var(--warning-muted);
	}

	.event-details {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-2);
		padding-block-start: var(--nais-space-4);
		overflow-wrap: anywhere;
		font-size: var(--sh-font-size-sm);
		line-height: var(--sh-font-line-height-compact);
	}

	.compact .event-details {
		padding-block-start: var(--nais-space-2);
	}

	.event-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--nais-space-2) var(--nais-space-8);
	}

	.event-title,
	.event-message {
		margin: 0;
	}

	.event-title {
		font-weight: var(--sh-font-weight-semibold);
	}

	.event-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--nais-space-2) var(--nais-space-8);
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-xs);
	}

	.event-timestamp {
		margin-inline-start: auto;
		text-align: end;
	}

	.event-time,
	.event-timestamp {
		font-variant-numeric: tabular-nums;
	}

	.event-instance {
		min-width: 0;
	}

	.compact .event-instance {
		flex-basis: 100%;
	}

	.event-instance code {
		font-family: var(--sh-font-family-mono);
		font-size: inherit;
	}

	.history-state {
		margin: 0;
		padding: var(--nais-space-16);
	}

	@container (max-width: 500px) {
		.timeline:not(.compact) .event {
			gap: var(--nais-space-8);
			padding-inline: var(--nais-space-12);
		}
	}
</style>
