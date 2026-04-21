<script lang="ts">
	import { page } from '$app/state';
	import DeploymentWithTeamListItem from '$lib/domain/list-items/DeploymentWithTeamListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Heading, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	const intervalOptions = ['7d', '30d', '6m', 'all'] as const;
	type Interval = (typeof intervalOptions)[number];

	let { data }: PageProps = $props();
	let { TenantDeployments, DeploymentsMetadata } = $derived(data);

	let interval: Interval = $derived.by(() => {
		const intervalParam = page.url.searchParams.get('interval') as Interval | null;
		return intervalParam && intervalOptions.includes(intervalParam) ? intervalParam : '7d';
	});

	const allEnvs = $derived(
		DeploymentsMetadata.data?.environments.nodes.map((env) => env.name) ?? []
	);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	function handleEnvironmentsChange(envs: string[]) {
		const environments = envs.length === allEnvs.length ? '' : envs.join(',');
		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeParams({ environments, after: '', before: '' });
		}
	}

	function handleIntervalChange(newInterval: Interval) {
		changeParams({
			after: '',
			before: '',
			interval: newInterval
		});
	}
</script>

<div class="page">
	<div class="container">
		<GraphErrors errors={TenantDeployments.errors} />
		{#if TenantDeployments.data}
			<div>
				<div class="header">
					<Heading as="h1" size="large">Tenant Deployments</Heading>
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

				{#if TenantDeployments.data.deployments.pageInfo.totalCount > 0}
					<List
						title="{TenantDeployments.data.deployments.pageInfo
							.totalCount} deployment{TenantDeployments.data.deployments.pageInfo.totalCount !== 1
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
									checked={DeploymentsMetadata.data?.environments.nodes.every((env) =>
										filteredEnvs.includes(env.name)
									)
										? true
										: filteredEnvs.length > 0
											? 'indeterminate'
											: false}
									onchange={(checked) => handleEnvironmentsChange(checked ? allEnvs : [])}
								>
									All environments
								</ActionMenuCheckboxItem>
								{#each DeploymentsMetadata.data?.environments.nodes ?? [] as { name, id } (id)}
									<ActionMenuCheckboxItem
										checked={filteredEnvs.includes(name)}
										onchange={(checked) =>
											handleEnvironmentsChange(
												checked
													? [...filteredEnvs, name]
													: filteredEnvs.filter((env) => env !== name)
											)}
									>
										{name}
									</ActionMenuCheckboxItem>
								{/each}
							</ActionMenu>
						{/snippet}
						{#each TenantDeployments.data.deployments.nodes as deployment (deployment.id)}
							<DeploymentWithTeamListItem {deployment} />
						{/each}
					</List>
				{/if}

				<Pagination
					page={TenantDeployments.data.deployments.pageInfo}
					loaders={cursorPaginationLoaders(page.url, TenantDeployments.data.deployments.pageInfo)}
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
