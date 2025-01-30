<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { ApplicationOrderField, JobOrderField, OrderDirection, WorkloadState } from '$houdini';
	import Card from '$lib/Card.svelte';
	import InstanceStatus from '$lib/components/InstanceStatus.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, Button, Detail, Search, Tooltip } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuDivider,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental.js';
	import {
		BriefcaseClockIcon,
		ChevronDownIcon,
		CircleFillIcon,
		RocketIcon
	} from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import type { PageData } from './$houdini';
	import Pagination from '$lib/Pagination.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Applications, initialEnvironments } = $derived(data);

	let filter: string = $state(data.initialFilter);
	$effect(() => {
		filter = data.initialFilter;
	});
	let rows: number = $state(data.initialRows);
	$effect(() => {
		rows = data.initialRows;
	});

	let views: { [key: string]: boolean } = $state({});
	let filteredEnvs = $derived(initialEnvironments?.split(','));

	let appOrderField: keyof typeof JobOrderField = $state(ApplicationOrderField.NAME);
	let appOrderDirection: keyof typeof OrderDirection = $state(OrderDirection.ASC);

	$effect(() => {
		$Applications.data?.team.environments.forEach((env) => {
			if (!filteredEnvs || filteredEnvs.includes(env.name)) {
				views[env.name] = true;
			} else {
				views[env.name] = false;
			}
		});
	});

	const handleCheckboxChange = (checkboxId: string, checked: boolean) => {
		if (checkboxId === '*') {
			Object.keys(views).forEach((key) => {
				views[key] = checked;
			});
		} else {
			views[checkboxId] = checked;
		}
		handleFilter();
	};

	const handleSortDirection = (key: string) => {
		appOrderDirection = key as keyof typeof OrderDirection;
		handleFilter();
	};

	const handleSortField = (key: string) => {
		appOrderField = JobOrderField[key as keyof typeof JobOrderField];
		handleFilter();
	};

	const handleNumberOfRows = (value: number) => {
		rows = Number(value);
		handleFilter();
	};

	const handleFilter = () => {
		replaceState(page.url.toString(), {});
		const environments: string[] = Object.keys(views).filter((key) => {
			return views[key];
		});

		changeParams({
			direction: appOrderDirection,
			field: appOrderField,
			environments: environments.length > 0 ? environments.join(',') : '',
			filter: filter,
			rows: rows.toString()
		});
	};
</script>

<GraphErrors errors={$Applications.errors} />

{#if $Applications.data}
	{@const apps = $Applications.data.team.applications}
	<Card columns={12}>
		<div class="header">
			<div class="heading">
				<BriefcaseClockIcon width="32px" height="32px" />
				<h3>Applications</h3>
			</div>
		</div>
		{#if apps.nodes.length > 0 || $Applications.data.team.totalApplications.pageInfo.totalCount > 0}
			<BodyLong style="margin-bottom: 1rem;">
				Applications are long-running processes designed to handle continuous workloads and remain
				active until stopped or restarted.
				<a href="https://doc.nais.io/workloads/application">Learn more about applications.</a>
			</BodyLong>
			<div class="search">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleFilter();
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
							handleFilter();
						}}
					/>
				</form>
			</div>
			<div class="applications-list">
				<div class="applications-header">
					<div class="applications-count">
						<Detail>{apps.pageInfo.totalCount} applications</Detail>
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
									Environment
								</Button>
							{/snippet}
							<ActionMenuCheckboxItem
								checked={Object.values(views).length > 0 && Object.values(views).every(Boolean)
									? true
									: Object.values(views).some(Boolean)
										? 'indeterminate'
										: false}
								onchange={(checked) => handleCheckboxChange('*', checked)}
							>
								All environments
							</ActionMenuCheckboxItem>
							{#each $Applications.data.team.environments as env}
								<ActionMenuCheckboxItem
									checked={views[env.name]}
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
										{#if appOrderDirection === OrderDirection.ASC}
											<SortAscendingIcon size="1rem" />
										{:else}
											<SortDescendingIcon size="1rem" />
										{/if}
									{/snippet}
									<span style="display: flex; align-items: center; gap: 8px;">
										{appOrderField === JobOrderField.NAME
											? 'Name'
											: appOrderField === JobOrderField.STATUS
												? 'Status'
												: appOrderField === JobOrderField.ENVIRONMENT
													? 'Environment'
													: 'Deployed'}
										<ChevronDownIcon aria-hidden="true" height="20px" width="20px" />
									</span>
								</Button>
							{/snippet}
							<ActionMenuRadioGroup bind:value={appOrderField} label="Order by">
								<ActionMenuRadioItem
									value={JobOrderField.NAME}
									onselect={(value) => handleSortField(value as string)}>Name</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value={JobOrderField.STATUS}
									onselect={(value) => handleSortField(value as string)}>Status</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value={JobOrderField.ENVIRONMENT}
									onselect={(value) => handleSortField(value as string)}
									>Environment</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value={JobOrderField.DEPLOYMENT_TIME}
									onselect={(value) => handleSortField(value as string)}
									>Deployed</ActionMenuRadioItem
								>
							</ActionMenuRadioGroup>
							<ActionMenuDivider />
							<ActionMenuRadioGroup bind:value={appOrderDirection} label="Direction">
								{#if appOrderField === JobOrderField.DEPLOYMENT_TIME}
									<ActionMenuRadioItem
										value={OrderDirection.DESC}
										onselect={(value) => handleSortDirection(value as string)}
										>Newest</ActionMenuRadioItem
									>
									<ActionMenuRadioItem
										value={OrderDirection.ASC}
										onselect={(value) => handleSortDirection(value as string)}
										>Oldest</ActionMenuRadioItem
									>
								{:else}
									<ActionMenuRadioItem
										value={OrderDirection.ASC}
										onselect={(value) => handleSortDirection(value as string)}
										>Ascending</ActionMenuRadioItem
									>
									<ActionMenuRadioItem
										value={OrderDirection.DESC}
										onselect={(value) => handleSortDirection(value as string)}
										>Descending</ActionMenuRadioItem
									>
								{/if}
							</ActionMenuRadioGroup>
							<ActionMenuDivider />
							<ActionMenuRadioGroup bind:value={rows} label="Rows per page">
								<ActionMenuRadioItem
									value="5"
									onselect={(value) => handleNumberOfRows(value as number)}>5</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value="10"
									onselect={(value) => handleNumberOfRows(value as number)}>10</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value="25"
									onselect={(value) => handleNumberOfRows(value as number)}>25</ActionMenuRadioItem
								>
								<ActionMenuRadioItem
									value="50"
									onselect={(value) => handleNumberOfRows(value as number)}>50</ActionMenuRadioItem
								>
							</ActionMenuRadioGroup>
						</ActionMenu>
					</div>
				</div>
				{#each apps.nodes as app}
					<div class="applications-list-item">
						<div class="application-link-wrapper">
							<div>
								{#if app.status.state === WorkloadState.NAIS}
									<Tooltip content="Job is NAIS">
										<CircleFillIcon
											style="color: var(--a-icon-success); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else if app.status.state === WorkloadState.NOT_NAIS}
									<Tooltip content="Job is not NAIS">
										<CircleFillIcon
											style="color: var(--a-icon-warning); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else if app.status.state === WorkloadState.FAILING}
									<Tooltip content="Job is failing">
										<CircleFillIcon
											style="color: var(--a-icon-danger); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else}
									<Tooltip content="Job status is UNKNOWN">
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
							<div></div>
							<div><InstanceStatus {app} /></div>
							{#if app.deploymentInfo.timestamp}
								<div><RocketIcon /></div>

								<Tooltip
									content="Last deploy - {format(app.deploymentInfo.timestamp, 'PPPP', {
										locale: enGB
									})}"
								>
									<div class="application-detail">
										<Detail><Time time={app.deploymentInfo.timestamp} distance={true} /></Detail>
									</div>
								</Tooltip>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<Pagination
				page={apps.pageInfo}
				loaders={{
					loadPreviousPage: () => Applications.loadPreviousPage({ last: rows }),
					loadNextPage: () => Applications.loadNextPage({ first: rows })
				}}
			/>
		{:else if $Applications.data.team.totalApplications.pageInfo.totalCount == 0}
			<BodyLong
				><strong>No applications found.</strong> Applications are long-running processes designed to
				handle continuous workloads and remain active until stopped or restarted.
				<a href="https://doc.nais.io/workloads/application"
					>Learn more about applications and how to get started.</a
				>
			</BodyLong>
		{/if}
	</Card>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin: 1rem 0;
		.heading {
			display: flex;
			align-items: center;
			width: 50%;
			gap: 4px;
			h3 {
				margin: 0;
			}
		}
	}
	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
	.applications-list {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;
		/*overflow: hidden;*/

		.applications-header {
			background-color: var(--a-surface-subtle);
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
			min-width: 110px;
			gap: 4px;
			flex-direction: column;
		}
		.application-detail {
			display: flex;
			gap: 4px;
			align-items: center;
		}
	}
</style>
