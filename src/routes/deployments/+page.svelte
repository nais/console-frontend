<script lang="ts">
	import { page } from '$app/state';
	import DeploymentWithTeamListItem from '$lib/domain/list-items/DeploymentWithTeamListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	const intervalOptions = ['7d', '30d', '6m', 'all'] as const;
	type Interval = (typeof intervalOptions)[number];

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			interval?: Interval;
		} = {}
	) => {
		const updateParams: Record<string, string> = {
			before: params.before ?? before,
			after: params.after ?? after
		};

		if (params.interval !== undefined) {
			updateParams.interval = params.interval;
		}

		changeParams(updateParams);
	};

	let { data }: PageProps = $props();
	let { TenantDeployments } = $derived(data);
	let after: string = $derived($TenantDeployments.variables?.after ?? '');
	let before: string = $derived($TenantDeployments.variables?.before ?? '');

	const intervalParam = page.url.searchParams.get('interval') as Interval | null;
	let interval = $state<Interval>(
		intervalParam && intervalOptions.includes(intervalParam) ? intervalParam : '7d'
	);

	function handleIntervalChange(newInterval: Interval) {
		interval = newInterval;
		changeQuery({
			after: '',
			before: '',
			interval: newInterval
		});
	}
</script>

<div class="page">
	<div class="container">
		<GraphErrors errors={$TenantDeployments.errors} />
		{#if $TenantDeployments.fetching}
			<div class="loading">
				<Loader size="3xlarge" />
			</div>
		{:else if $TenantDeployments.data}
			<div>
				<div class="header">
					<Heading level="1">Tenant Deployments</Heading>
					<div class="toggles">
						<ToggleGroup
							size="small"
							label="Interval"
							value={interval}
							onchange={(i) => handleIntervalChange(i as Interval)}
						>
							{#each intervalOptions as option (option)}
								<ToggleGroupItem value={option}>{option}</ToggleGroupItem>
							{/each}
						</ToggleGroup>
					</div>
				</div>

				{#if $TenantDeployments.data?.deployments.pageInfo.totalCount > 0}
					<List
						title="{$TenantDeployments.data.deployments.pageInfo
							.totalCount} deployment{$TenantDeployments.data.deployments.pageInfo.totalCount !== 1
							? 's'
							: ''}"
					>
						{#each $TenantDeployments.data.deployments.nodes as deployment (deployment.id)}
							<DeploymentWithTeamListItem {deployment} />
						{/each}
					</List>
				{/if}

				<Pagination
					page={$TenantDeployments.data.deployments.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({
								after: '',
								before: $TenantDeployments.data?.deployments.pageInfo.startCursor ?? ''
							});
						},
						loadNextPage: () => {
							changeQuery({
								before: '',
								after: $TenantDeployments.data?.deployments.pageInfo.endCursor ?? ''
							});
						}
					}}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);

		.loading {
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 400px;
		}
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.toggles {
		display: flex;
		gap: var(--spacing-layout);
		flex-direction: row;
		justify-content: flex-end;
		margin-bottom: var(--spacing-layout);
	}
</style>
