<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Detail, Heading, Link, Tooltip } from '@nais/ds-svelte-community';
	import { CircleFillIcon, RocketIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import IconWithText from '../IconWithText.svelte';
	import ListItem from './ListItem.svelte';

	const {
		app
	}: {
		app: {
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
	<IconWithText size="large" description={app.environment.name}>
		{#snippet icon()}
			<Tooltip
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
					}[app.status.state] ?? 'info'}); font-size: 0.5rem"
				/>
			</Tooltip>
		{/snippet}
		{#snippet text()}
			<Heading level="4" size="xsmall">
				<Link href="#">{app.name}</Link>
			</Heading>
		{/snippet}
	</IconWithText>
	<div class="right">
		{#if app.deployments.nodes.length > 0}
			{@const timestamp = app.deployments.nodes[0].createdAt}
			<Tooltip
				content="Last deploy - {format(timestamp, 'PPPP', {
					locale: enGB
				})}"
			>
				<IconWithText size="small" icon={RocketIcon}>
					{#snippet text()}
						<Time time={timestamp} distance={true} />
					{/snippet}
				</IconWithText>
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
