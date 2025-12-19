<script lang="ts">
	import { page } from '$app/state';
	import DeploymentWithTeamListItem from '$lib/domain/list-items/DeploymentWithTeamListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Heading, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	const intervalOptions = ['7d', '30d', '6m', 'all'] as const;
	type Interval = (typeof intervalOptions)[number];

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			interval?: Interval;
			environments?: string;
		} = {}
	) => {
		const updateParams: Record<string, string> = {
			before: params.before ?? before,
			after: params.after ?? after,
			interval: params.interval ?? interval,
			environments: params.environments ?? currentEnvironments
		};

		changeParams(updateParams);
	};

	let { data }: PageProps = $props();
	let { TenantDeployments, DeploymentsMetadata } = $derived(data);
	let after: string = $derived($TenantDeployments.variables?.after ?? '');
	let before: string = $derived($TenantDeployments.variables?.before ?? '');

	const intervalParam = page.url.searchParams.get('interval') as Interval | null;
	let interval = $state<Interval>(
		intervalParam && intervalOptions.includes(intervalParam) ? intervalParam : '7d'
	);

	const allEnvs = $derived(
		$DeploymentsMetadata.data?.environments.nodes.map((env) => env.name) ?? []
	);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	const currentEnvironments = $derived(
		filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',')
	);

	$effect(() => {
		const environments = filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

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
					<Heading level="1" size="large">Tenant Deployments</Heading>
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
						{#snippet menu()}
							<ActionMenu>
								{#snippet trigger(props)}
									<Button
										variant="tertiary-neutral"
										size="small"
										iconPosition="right"
										{...props}
										icon={ChevronDownIcon}
									>
										<span style="font-weight: normal">Environment</span>
									</Button>
								{/snippet}
								<ActionMenuCheckboxItem
									checked={$DeploymentsMetadata.data?.environments.nodes.every((env) =>
										filteredEnvs.includes(env.name)
									)
										? true
										: filteredEnvs.length > 0
											? 'indeterminate'
											: false}
									onchange={(checked) => (filteredEnvs = checked ? allEnvs : [])}
								>
									All environments
								</ActionMenuCheckboxItem>
								{#each $DeploymentsMetadata.data?.environments.nodes ?? [] as { name, id } (id)}
									<ActionMenuCheckboxItem
										checked={filteredEnvs.includes(name)}
										onchange={(checked) =>
											(filteredEnvs = checked
												? [...filteredEnvs, name]
												: filteredEnvs.filter((env) => env !== name))}
									>
										{name}
									</ActionMenuCheckboxItem>
								{/each}
							</ActionMenu>
						{/snippet}
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
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);

		.loading {
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 400px;
		}
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
