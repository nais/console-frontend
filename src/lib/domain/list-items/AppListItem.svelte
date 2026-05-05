<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { Detail, Tooltip } from '@nais/ds-svelte-community';
	import { CircleFillIcon, RocketIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import IssueSeverityTags from '../issues/IssueSeverityTags.svelte';

	const {
		app
	}: {
		app: {
			__typename: string | null;
			name: string;
			teamEnvironment: {
				environment: { name: string };
			};
			team: { slug: string };
			state: string;
			deployments: { nodes: { createdAt: Date }[] };
			instances: {
				pageInfo: { totalCount: number };
				edges: { node: { status: { message: string; state: string } } }[];
			};
			issues: {
				pageInfo: { totalCount: number };
				edges: { node: { severity: string } }[];
			};
		};
	} = $props();
</script>

<ListItem>
	<div class="app-row">
		<div class="primary">
			<IconLabel
				as="h4"
				href="/team/{app.team.slug}/{app.teamEnvironment.environment.name}/app/{app.name}"
				size="large"
				label={app.name}
				tag={{
					label: app.teamEnvironment.environment.name,
					variant: envTagVariant(app.teamEnvironment.environment.name)
				}}
			>
				{#snippet icon()}
					<TooltipAlignHack
						content={{
							RUNNING: 'Application is running',
							NOT_RUNNING: 'Application is not running',
							UNKNOWN: 'Unkown status'
						}[app.state] ?? ''}
					>
						{#if app.state === 'RUNNING'}
							<RunningIndicator />
						{:else if app.state === 'NOT_RUNNING'}
							<CircleFillIcon
								style="width: 24px; color: light-dark(var(--ax-bg-danger-strong), var(--ax-bg-danger-strong)); font-size: 0.7rem"
							/>
						{:else}
							<CircleFillIcon
								style="width: 24px; color: light-dark(var(--ax-text-neutral-decoration), var(--ax-text-neutral-decoration)); font-size: 0.7rem"
							/>
						{/if}
					</TooltipAlignHack>
				{/snippet}
			</IconLabel>
		</div>

		<div class="meta-slot issues-slot">
			{#if app.issues?.pageInfo.totalCount > 0}
				{@const criticalCount = countIssuesBySeverity(app.issues.edges, 'CRITICAL')}
				{@const warningCount = countIssuesBySeverity(app.issues.edges, 'WARNING')}
				{@const todoCount = countIssuesBySeverity(app.issues.edges, 'TODO')}

				<IssueSeverityTags
					critical={criticalCount}
					warning={warningCount}
					todo={todoCount}
					layout="inline"
				/>
			{/if}
		</div>

		<div class="right">
			<div class="meta-slot deploy-slot">
				{#if app.deployments.nodes.length > 0}
					{@const timestamp = app.deployments.nodes[0].createdAt}
					<Tooltip
						content="Last deploy - {format(timestamp, 'PPPP', {
							locale: enGB
						})}"
					>
						<IconLabel size="small" icon={RocketIcon}>
							{#snippet label()}
								<Time time={timestamp} distance={true} />
							{/snippet}
						</IconLabel>
					</Tooltip>
				{/if}
			</div>

			<div class="meta-slot status-slot">
				<Detail>
					{#if app.instances.pageInfo.totalCount === 0}
						No instances
					{:else}
						{app.instances.edges.filter((s) => s.node.status.state === 'RUNNING').length} / {app
							.instances.pageInfo.totalCount} running
					{/if}
				</Detail>
			</div>
		</div>
	</div>
</ListItem>

<style>
	.app-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 11rem;
		align-items: center;
		column-gap: var(--ax-space-24);
		min-block-size: 5rem;
		width: 100%;
	}

	.primary {
		min-width: 0;
	}

	.primary :global(.icon-label) {
		min-width: 0;
	}

	.primary :global(.content) {
		min-width: 0;
	}

	.primary :global(.aksel-heading),
	.primary :global(.aksel-heading a) {
		display: block;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.right {
		display: grid;
		grid-template-rows: auto auto;
		inline-size: 11rem;
		justify-items: end;
		align-items: end;
		row-gap: var(--ax-space-2);
	}

	.meta-slot {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		min-width: 0;
		white-space: nowrap;
	}

	.deploy-slot :global(.icon-label) {
		justify-content: flex-end;
	}

	.deploy-slot :global(.icon-label > *),
	.deploy-slot :global(.content) {
		flex: 0 0 auto;
	}

	.issues-slot {
		justify-content: flex-end;
	}

	.issues-slot :global(.issues-container.inline) {
		width: 100%;
		flex-wrap: nowrap;
		justify-content: flex-end;
		gap: var(--ax-space-8);
	}

	.issues-slot :global(.aksel-tag) {
		white-space: nowrap;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px) {
		.app-row {
			grid-template-columns: 1fr;
			align-items: start;
			min-block-size: auto;
			row-gap: var(--ax-space-12);
		}

		.right {
			grid-template-columns: 1fr;
			justify-items: end;
			row-gap: var(--ax-space-4);
			column-gap: 0;
		}

		.issues-slot {
			justify-content: flex-end;
		}

		.issues-slot :global(.issues-container.inline) {
			flex-wrap: wrap;
			justify-content: flex-end;
			gap: var(--ax-space-8);
		}
	}
</style>
