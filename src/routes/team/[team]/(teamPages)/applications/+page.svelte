<script lang="ts">
	import {
		ApplicationOrderField,
		OrderDirection,
		type ApplicationOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import AppListItem from '$lib/components/list/AppListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, Button, Search } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuDivider,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental.js';
	import { ChevronDownIcon, PackageIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Applications, initialEnvironments } = $derived(data);

	let filter = $state($Applications.variables?.filter?.name ?? '');

	let filteredEnvs = $derived(
		initialEnvironments === 'none'
			? []
			: (initialEnvironments?.split(',') ??
					$Applications.data?.team.environments.map((env) => env.name) ??
					[])
	);

	let orderField: keyof typeof ApplicationOrderField = $derived(
		$Applications.variables?.orderBy?.field ?? ApplicationOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$Applications.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

	const handleCheckboxChange = (checkboxId: string, checked: boolean) => {
		changeQuery({
			environments:
				checkboxId === '*'
					? checked
						? ($Applications.data?.team.environments.map((env) => env.name) ?? [])
						: []
					: checked
						? [...filteredEnvs, checkboxId]
						: filteredEnvs.filter((env) => env !== checkboxId)
		});
	};

	const handleSortDirection = (key: string) => {
		changeQuery({ direction: key as OrderDirection$options });
	};

	const handleSortField = (key: string) => {
		changeQuery({
			field: key as keyof typeof ApplicationOrderField
		});
	};

	const changeQuery = (
		params: {
			field?: ApplicationOrderField$options;
			direction?: OrderDirection$options;
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string[];
		} = {}
	) => {
		changeParams({
			direction: params.direction || orderDirection,
			field: params.field || orderField,
			before: params.before ?? '',
			after: params.after ?? '',
			filter: params.newFilter ?? filter,
			environments:
				params.environments?.length === 0
					? 'none'
					: (params.environments?.join(',') ?? filteredEnvs.join(','))
		});
	};
</script>

<div class="wrapper">
	<div class="content">
		<div class="header">
			<IconWithText text="Applications" icon={PackageIcon} size="large" />
		</div>

		<BodyLong spacing>
			{#if $Applications.data?.team.totalApplications.pageInfo.totalCount == 0}
				<strong>No applications found.</strong> Applications are long-running processes designed to
				handle continuous workloads and remain active until stopped or restarted.
				<a href="https://doc.nais.io/workloads/application"
					>Learn more about applications and how to get started.</a
				>
			{:else}
				Applications are long-running processes designed to handle continuous workloads and remain
				active until stopped or restarted.
				<a href="https://doc.nais.io/workloads/application">Learn more about applications.</a>
			{/if}
		</BodyLong>

		<GraphErrors errors={$Applications.errors} />

		{#if $Applications.data && $Applications.data?.team.totalApplications.pageInfo.totalCount > 0}
			{@const apps = $Applications.data.team.applications}
			<div class="search">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						changeQuery({ newFilter: filter });
					}}
				>
					<Search
						clearButton={true}
						clearButtonLabel="Clear"
						label="filter applications"
						placeholder="Filter by name"
						hideLabel={true}
						size="small"
						variant="simple"
						width="100%"
						autocomplete="off"
						bind:value={filter}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				</form>
			</div>
			<List
				title="{apps.pageInfo.totalCount} application{apps.pageInfo.totalCount !== 1 ? 's' : ''}
						{apps.pageInfo.totalCount !== $Applications.data.team.totalApplications.pageInfo.totalCount
					? `(of total ${$Applications.data.team.totalApplications.pageInfo.totalCount})`
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
							checked={$Applications.data?.team.environments.every((env) =>
								filteredEnvs.includes(env.name)
							)
								? true
								: filteredEnvs.length > 0
									? 'indeterminate'
									: false}
							onchange={(checked) => handleCheckboxChange('*', checked)}
						>
							All environments
						</ActionMenuCheckboxItem>
						{#each $Applications.data?.team.environments ?? [] as env (env.id)}
							<ActionMenuCheckboxItem
								checked={filteredEnvs.includes(env.name)}
								onchange={(checked) => handleCheckboxChange(env.name, checked)}
							>
								{env.name}
							</ActionMenuCheckboxItem>
						{/each}
					</ActionMenu>
					<ActionMenu>
						{#snippet trigger(props)}
							<div style="min-width: 164px">
								<Button variant="tertiary-neutral" size="small" iconPosition="left" {...props}>
									{#snippet icon()}
										{#if orderDirection === OrderDirection.ASC}
											<SortAscendingIcon size="1rem" />
										{:else}
											<SortDescendingIcon size="1rem" />
										{/if}
									{/snippet}
									<span style="display: flex; align-items: center; gap: 8px;">
										{orderField === ApplicationOrderField.NAME
											? 'Name'
											: orderField === ApplicationOrderField.STATUS
												? 'Status'
												: orderField === ApplicationOrderField.ENVIRONMENT
													? 'Environment'
													: 'Deployed'}
										<ChevronDownIcon aria-hidden="true" height="20px" width="20px" />
									</span>
								</Button>
							</div>
						{/snippet}
						{#key orderField}
							<ActionMenuRadioGroup value={orderField} label="Order by">
								<ActionMenuRadioItem
									value={ApplicationOrderField.NAME}
									onselect={(value) => handleSortField(value as string)}>Name</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value={ApplicationOrderField.STATUS}
									onselect={(value) => handleSortField(value as string)}>Status</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value={ApplicationOrderField.ENVIRONMENT}
									onselect={(value) => handleSortField(value as string)}
									>Environment</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value={ApplicationOrderField.DEPLOYMENT_TIME}
									onselect={(value) => handleSortField(value as string)}
									>Deployed</ActionMenuRadioItem
								>
							</ActionMenuRadioGroup>
						{/key}
						<ActionMenuDivider />
						{#key orderDirection}
							<ActionMenuRadioGroup value={orderDirection} label="Sort direction">
								{#if orderField === ApplicationOrderField.DEPLOYMENT_TIME}
									<ActionMenuRadioItem
										value={OrderDirection.ASC}
										onselect={(value) => handleSortDirection(value as string)}
									>
										<div class="icon">
											<SortAscendingIcon size="1rem" />Oldest
										</div>
									</ActionMenuRadioItem>
									<ActionMenuRadioItem
										value={OrderDirection.DESC}
										onselect={(value) => handleSortDirection(value as string)}
									>
										<div class="icon">
											<SortDescendingIcon size="1rem" />Newest
										</div>
									</ActionMenuRadioItem>
								{:else}
									<ActionMenuRadioItem
										value={OrderDirection.ASC}
										onselect={(value) => handleSortDirection(value as string)}
									>
										<div class="icon">
											<SortAscendingIcon size="1rem" />Ascending
										</div>
									</ActionMenuRadioItem>
									<ActionMenuRadioItem
										value={OrderDirection.DESC}
										onselect={(value) => handleSortDirection(value as string)}
									>
										<div class="icon">
											<SortDescendingIcon size="1rem" />Descending
										</div>
									</ActionMenuRadioItem>
								{/if}
							</ActionMenuRadioGroup>
						{/key}
					</ActionMenu>
				{/snippet}
				{#each apps.nodes as app (app.id)}
					<AppListItem {app} />
				{/each}
			</List>
			<Pagination
				page={apps.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: apps.pageInfo.startCursor ?? '' });
					},
					loadNextPage: () => {
						changeQuery({ after: apps.pageInfo.endCursor ?? '' });
					}
				}}
			/>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--a-spacing-12);
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.icon {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: 4px;
	}
</style>
