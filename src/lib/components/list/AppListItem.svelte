<script lang="ts">
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
			environment: { name: string };
			team: { slug: string };
			status: { state: string };
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
		label={app.name}
		href="/team/{app.team.slug}/{app.environment.name}/app/{app.name}"
		description={app.environment.name}
		size="large"
	>
		{#snippet icon()}
			<TooltipAlignHack
				content={{
					NAIS: 'Application is Nais',
					FAILING: 'Application is failing',
					NOT_NAIS: 'Application is not Nais',
					UNKNOWN: 'Application status is unknown'
				}[app.status.state] ?? ''}
			>
				<CircleFillIcon
					style="color: var(--a-icon-{{
						NAIS: 'success',
						FAILING: 'danger',
						NOT_NAIS: 'warning',
						UNKNOWN: 'info'
					}[app.status.state] ?? 'info'}); font-size: 0.7rem"
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
		gap: var(--a-spacing-05);
	}
</style>
