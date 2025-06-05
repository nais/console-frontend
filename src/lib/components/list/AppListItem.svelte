<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { Detail, Tooltip } from '@nais/ds-svelte-community';
	import { CircleFillIcon, RocketIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import IconLabel from '../IconLabel.svelte';
	import TooltipAlignHack from '../TooltipAlignHack.svelte';
	import ListItem from './ListItem.svelte';

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
			status: {
				state: string;
				errors?: {
					__typename: string | null;
					level: 'ERROR' | 'WARNING' | 'TODO';
				}[];
			};
			deployments: { nodes: { createdAt: Date }[] };
			instances: {
				pageInfo: { totalCount: number };
				edges: { node: { status: { message: string; state: string } } }[];
			};
		};
	} = $props();
</script>

<ListItem>
	<IconLabel
		level="4"
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
					NAIS: 'Application is healthy',
					FAILING: 'Application is failing',
					NOT_NAIS: 'Application has issues',
					UNKNOWN: 'Application status is unknown'
				}[app.status.state] ?? ''}
			>
				<CircleFillIcon
					style="color: var(--ax-text-{{
						NAIS: 'success',
						FAILING: 'danger',
						NOT_NAIS: 'warning',
						UNKNOWN: 'info'
					}[app.status.state] ?? 'info'}-decoration); font-size: 0.7rem"
				/>
			</TooltipAlignHack>
		{/snippet}
	</IconLabel>
	<div class="right">
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
		<Detail>
			{#if app.instances.pageInfo.totalCount === 0}
				No instances
			{:else}
				{app.instances.edges.filter((s) => s.node.status.state === 'RUNNING').length} / {app
					.instances.pageInfo.totalCount} running
			{/if}
		</Detail>
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2s);
	}
</style>
