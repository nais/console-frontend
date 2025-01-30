<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { JobOrderField, OrderDirection, WorkloadState } from '$houdini';
	import Card from '$lib/Card.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, Button, Detail, Loader, Search, Tooltip } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuDivider,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental.js';
	import {
		BriefcaseClockIcon,
		CheckmarkCircleFillIcon,
		ChevronDownIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		CircleFillIcon,
		QuestionmarkIcon,
		RocketIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Jobs, initialEnvironments } = $derived(data);

	let filter: string = $state(data.initialFilter);
	$effect(() => {
		filter = data.initialFilter;
	});
	let rows: number = $state(10);

	let views: { [key: string]: boolean } = $state({});
	let filteredEnvs = $derived(initialEnvironments?.split(','));

	let jobOrderField: keyof typeof JobOrderField = $state(JobOrderField.NAME);
	let jobOrderDirection: keyof typeof OrderDirection = $state(OrderDirection.ASC);

	$effect(() => {
		$Jobs.data?.team.environments.forEach((env) => {
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
		jobOrderDirection = key as keyof typeof OrderDirection;
		handleFilter();
	};

	const handleSortField = (key: string) => {
		jobOrderField = JobOrderField[key as keyof typeof JobOrderField];
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
			direction: jobOrderDirection,
			field: jobOrderField,
			environments: environments.length > 0 ? environments.join(',') : '',
			filter: filter,
			rows: rows.toString()
		});
	};
</script>

<GraphErrors errors={$Jobs.errors} />

{#if $Jobs.data}
	{@const jobs = $Jobs.data.team.jobs}
	<Card columns={12}>
		<div class="header">
			<div class="heading">
				<BriefcaseClockIcon width="32px" height="32px" />
				<h3>Jobs</h3>
			</div>
		</div>
		{#if jobs.nodes.length > 0 || $Jobs.data.team.totalJobs.pageInfo.totalCount > 0}
			<BodyLong style="margin-bottom: 1rem;">
				Jobs are used for one-time or scheduled tasks that run to completion and then exit.
				<a href="https://doc.nais.io/workloads/job/">Learn more about jobs.</a>
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
						label="filter jobs"
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
			<div class="jobs-list">
				<div class="jobs-header">
					<div class="jobs-count">
						<Detail>{jobs.pageInfo.totalCount} jobs</Detail>
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
							{#each $Jobs.data.team.environments as env}
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
										{#if jobOrderDirection === OrderDirection.ASC}
											<SortAscendingIcon size="1rem" />
										{:else}
											<SortDescendingIcon size="1rem" />
										{/if}
									{/snippet}
									<span style="display: flex; align-items: center; gap: 8px;">
										{jobOrderField === JobOrderField.NAME
											? 'Name'
											: jobOrderField === JobOrderField.STATUS
												? 'Status'
												: jobOrderField === JobOrderField.ENVIRONMENT
													? 'Environment'
													: 'Deployed'}
										<ChevronDownIcon aria-hidden="true" height="20px" width="20px" />
									</span>
								</Button>
							{/snippet}
							<ActionMenuRadioGroup bind:value={jobOrderField} label="Order by">
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
							<ActionMenuRadioGroup bind:value={jobOrderDirection} label="Direction">
								{#if jobOrderField === JobOrderField.DEPLOYMENT_TIME}
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
				{#each jobs.nodes as job}
					<div class="jobs-list-item">
						<div class="job-link-wrapper">
							<div>
								{#if job.status.state === WorkloadState.NAIS}
									<Tooltip content="Job is NAIS">
										<CircleFillIcon
											style="color: var(--a-icon-success); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else if job.status.state === WorkloadState.NOT_NAIS}
									<Tooltip content="Job is not NAIS">
										<CircleFillIcon
											style="color: var(--a-icon-warning); align-self: flex-start; margin-left: -5px;"
											height="0.5rem"
											width="0.5rem"
										/>
									</Tooltip>
								{:else if job.status.state === WorkloadState.FAILING}
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
							<div class="job-link">
								<WorkloadLink workload={job} />
								<Detail>{job.environment.name}</Detail>
							</div>
						</div>
						<div class="job-info">
							<div style="display: flex; gap: 4px; align-items: center; ">
								{#if job.runs.nodes[0]?.status}
									{#if job.runs.nodes[0].status.state === 'RUNNING'}
										<Tooltip content="Job is running">
											<Loader size="xsmall" variant="interaction" />
										</Tooltip>
									{:else if job.runs.nodes[0].status.state === 'PENDING'}
										<Tooltip content="Job run pending">
											<Loader size="xsmall" variant="interaction" />
										</Tooltip>
									{:else if job.runs.nodes[0].status.state === 'SUCCEEDED'}
										<Tooltip content="Last job ran successfully">
											<CheckmarkCircleFillIcon style="color: var(--a-icon-success)" />
										</Tooltip>
									{:else if job.runs.nodes[0].status.state === 'FAILED'}
										<Tooltip content="Last job run failed">
											<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" />
										</Tooltip>
									{:else}
										<Tooltip content="Job run status is unknown">
											<QuestionmarkIcon />
										</Tooltip>
									{/if}
								{:else}
									<Tooltip content="Job run status is unknown">
										<QuestionmarkIcon />
									</Tooltip>
								{/if}
								{#if job.runs.nodes[0]?.startTime}
									<Tooltip
										content="Last run - {format(job.runs.nodes[0].startTime, 'PPPP', {
											locale: enGB
										})}"
									>
										<Detail><Time time={job.runs.nodes[0].startTime} distance={true} /></Detail>
									</Tooltip>
								{:else}
									<Detail>No runs</Detail>
								{/if}
							</div>

							{#if job.deploymentInfo.timestamp}
								<Tooltip
									content="Last deploy - {format(job.deploymentInfo.timestamp, 'PPPP', {
										locale: enGB
									})}"
								>
									<div class="job-detail">
										<RocketIcon />
										<Detail><Time time={job.deploymentInfo.timestamp} distance={true} /></Detail>
									</div>
								</Tooltip>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			{#if jobs.pageInfo.hasPreviousPage || jobs.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if jobs.pageInfo.pageStart !== jobs.pageInfo.pageEnd}
							{jobs.pageInfo.pageStart} - {jobs.pageInfo.pageEnd}
						{:else}
							{jobs.pageInfo.pageStart}
						{/if}

						of {jobs.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!jobs.pageInfo.hasPreviousPage}
							onclick={async () => {
								return await Jobs.loadPreviousPage({ last: rows });
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!jobs.pageInfo.hasNextPage}
							onclick={async () => {
								return await Jobs.loadNextPage({ first: rows });
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		{:else if $Jobs.data.team.totalJobs.pageInfo.totalCount == 0}
			<BodyLong
				><strong>No jobs found.</strong> Jobs are used for one-time or scheduled tasks that run to
				completion and then exit.
				<a href="https://doc.nais.io/workloads/job/"
					>Learn more about jobs and how to get started.</a
				></BodyLong
			>
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
	.jobs-list {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;
		/*overflow: hidden;*/

		.jobs-header {
			background-color: var(--a-surface-subtle);
			border-radius: 4px 4px 0 0;
			border-bottom: 1px solid var(--a-border-default);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
		}
		.jobs-count {
			font-weight: bold;
		}
		.jobs-list-item {
			.job-link-wrapper {
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

			.job-link {
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
		.job-info {
			min-width: 110px;
			display: flex;
			gap: 4px;
			flex-direction: column;
		}
		.job-detail {
			display: flex;
			gap: 4px;
			align-items: center;
		}
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
