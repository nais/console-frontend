<script lang="ts">
	import {
		ApplicationOrderField,
		OrderDirection,
		WorkloadState,
		type ApplicationOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import Card from '$lib/Card.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import InstanceStatus from '$lib/components/InstanceStatus.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, BodyShort, Button, Detail, Search, Tooltip } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuDivider,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental.js';
	import {
		ChevronDownIcon,
		CircleFillIcon,
		PackageIcon,
		RocketIcon
	} from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Applications, initialEnvironments } = $derived(data);

	let filter = $state($Applications.variables?.filter?.name ?? '');

	let rows: number = $derived.by(
		() => $Applications.variables?.first ?? $Applications.variables?.last ?? 10
	);

	let after: string = $derived($Applications.variables?.after ?? '');
	let before: string = $derived($Applications.variables?.before ?? '');

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

	const handleNumberOfRows = (value: number) => {
		changeQuery({ newRows: value, resetPagination: true });
	};

	const changeQuery = (
		params: {
			field?: ApplicationOrderField$options;
			direction?: OrderDirection$options;
			newRows?: number;
			after?: string;
			before?: string;
			resetPagination?: boolean;
			newFilter?: string;
			environments?: string[];
		} = {}
	) => {
		changeParams({
			direction: params.direction || orderDirection,
			field: params.field || orderField,
			rows: params.newRows?.toString() || rows.toString(),
			before: params.resetPagination ? '' : (params.before ?? before),
			after: params.resetPagination ? '' : (params.after ?? after),
			filter: params.newFilter ?? filter,
			environments:
				params.environments?.length === 0
					? 'none'
					: (params.environments?.join(',') ?? filteredEnvs.join(','))
		});
	};
</script>

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

{#if $Applications.data}
	{@const apps = $Applications.data.team.applications}
	<Card columns={12}>
		{#if apps.nodes.length > 0 || $Applications.data.team.totalApplications.pageInfo.totalCount > 0}
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
			<div class="applications-list">
				<div class="applications-header">
					<div class="applications-count">
						<BodyShort size="small" style="font-weight: bold;">
							{apps.pageInfo.totalCount} applications
							{apps.pageInfo.totalCount !==
							$Applications.data.team.totalApplications.pageInfo.totalCount
								? `(of total ${$Applications.data.team.totalApplications.pageInfo.totalCount})`
								: ''}</BodyShort
						>
					</div>
					<div style="display: flex; gap: 1rem;">
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
								checked={$Applications.data.team.environments.every((env) =>
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
							{#each $Applications.data.team.environments as env}
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
							{/snippet}
							{#key orderField}
								<ActionMenuRadioGroup value={orderField} label="Order by">
									<ActionMenuRadioItem
										value={ApplicationOrderField.NAME}
										onselect={(value) => handleSortField(value as string)}>Name</ActionMenuRadioItem
									>
									<ActionMenuRadioItem
										value={ApplicationOrderField.STATUS}
										onselect={(value) => handleSortField(value as string)}
										>Status</ActionMenuRadioItem
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
											value={OrderDirection.DESC}
											onselect={(value) => handleSortDirection(value as string)}
										>
											<div class="icon">
												<SortDescendingIcon size="1rem" />Newest
											</div>
										</ActionMenuRadioItem>
										<ActionMenuRadioItem
											value={OrderDirection.ASC}
											onselect={(value) => handleSortDirection(value as string)}
										>
											<div class="icon">
												<SortAscendingIcon size="1rem" />Oldest
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
							<ActionMenuDivider />
							{#key rows}
								<ActionMenuRadioGroup value={rows} label="Rows per page">
									<ActionMenuRadioItem
										value="5"
										onselect={(value) => handleNumberOfRows(value as number)}>5</ActionMenuRadioItem
									>
									<ActionMenuRadioItem
										value="10"
										onselect={(value) => handleNumberOfRows(value as number)}
										>10</ActionMenuRadioItem
									>
									<ActionMenuRadioItem
										value="25"
										onselect={(value) => handleNumberOfRows(value as number)}
										>25</ActionMenuRadioItem
									>
									<ActionMenuRadioItem
										value="50"
										onselect={(value) => handleNumberOfRows(value as number)}
										>50</ActionMenuRadioItem
									>
								</ActionMenuRadioGroup>
							{/key}
						</ActionMenu>
					</div>
				</div>
				{#each apps.nodes as app}
					<div class="applications-list-item">
						<div class="application-link-wrapper">
							<div>
								{#if app.status.state === WorkloadState.NAIS}
									<Tooltip content="Application is NAIS">
										<CircleFillIcon
											style="color: var(--a-icon-success); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else if app.status.state === WorkloadState.NOT_NAIS}
									<Tooltip content="Application is not NAIS">
										<CircleFillIcon
											style="color: var(--a-icon-warning); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else if app.status.state === WorkloadState.FAILING}
									<Tooltip content="Application is failing">
										<CircleFillIcon
											style="color: var(--a-icon-danger); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else}
									<Tooltip content="Application status is UNKNOWN">
										<CircleFillIcon
											style="color: var(--a-icon-neutral); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{/if}
							</div>
							<div class="application-link">
								<WorkloadLink workload={app} />
								<Detail>{app.environment.name}</Detail>
							</div>
						</div>
						<div class="application-info">
							{#if app.deployments.nodes.length > 0}
								{@const timestamp = app.deployments.nodes[0].createdAt}
								<RocketIcon style="font-size: 1.25rem" />
								<Tooltip
									content="Last deploy - {format(timestamp, 'PPPP', {
										locale: enGB
									})}"
								>
									<div class="application-detail">
										<Detail><Time time={timestamp} distance={true} /></Detail>
									</div>
								</Tooltip>
							{/if}
							<InstanceStatus {app} class="instance-status" />
						</div>
					</div>
				{/each}
			</div>
			<Pagination
				page={apps.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: apps.pageInfo.startCursor ?? '' });
						Applications.loadPreviousPage({ last: rows });
					},
					loadNextPage: () => {
						changeQuery({ after: apps.pageInfo.endCursor ?? '' });
						Applications.loadNextPage({ first: rows });
					}
				}}
			/>
		{/if}
	</Card>
{/if}

<style>
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
	.applications-list {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;

		.applications-header {
			background-color: var(--active-color);
			border-radius: 4px 4px 0 0;
			border-bottom: 1px solid var(--a-border-default);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
		}
		.applications-count {
			font-weight: bold;
		}
		.applications-list-item {
			.application-link-wrapper {
				display: flex;
				gap: 0.3rem;
			}
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;

			&:not(:last-of-type) {
				border-bottom: 1px solid var(--a-border-default);
			}

			&:hover {
				background-color: var(--a-surface-subtle);
			}

			.application-link {
				:global(a) {
					font-weight: var(--a-font-weight-bold);
					&:not(:active) {
						color: var(--a-text-defualt);
					}
					text-decoration: none;
					&:hover {
						text-decoration: underline;
					}
				}
			}
		}
		.application-info {
			display: grid;
			grid-template-columns: 20px 1fr;
			min-width: 114px;
			gap: 4px;

			:global(.instance-status) {
				grid-column: 2;
			}
		}
		.application-detail {
			display: flex;
			gap: 4px;
			align-items: center;
		}
	}
</style>
