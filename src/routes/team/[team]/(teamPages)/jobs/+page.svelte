<script lang="ts">
	import {
		JobOrderField,
		OrderDirection,
		WorkloadState,
		type JobOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import Card from '$lib/Card.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import {
		BodyLong,
		BodyShort,
		Button,
		Detail,
		Loader,
		Search,
		Tooltip
	} from '@nais/ds-svelte-community';
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

	let filter = $state($Jobs.variables?.filter?.name ?? '');

	let rows: number = $derived.by(() => $Jobs.variables?.first ?? $Jobs.variables?.last ?? 10);

	let after: string = $derived($Jobs.variables?.after ?? '');
	let before: string = $derived($Jobs.variables?.before ?? '');

	let views: { [key: string]: boolean } = $state({});
	let filteredEnvs = $derived(initialEnvironments?.split(','));

	let orderField: keyof typeof JobOrderField = $derived(
		$Jobs.variables?.orderBy?.field ?? JobOrderField.NAME
	);

	let orderDirection: keyof typeof OrderDirection = $derived(
		$Jobs.variables?.orderBy?.direction ?? OrderDirection.ASC
	);

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
		changeQuery();
	};

	const handleSortDirection = (key: string) => {
		changeQuery({ direction: key as OrderDirection$options });
	};

	const handleSortField = (key: string) => {
		changeQuery({
			field: key as keyof typeof JobOrderField
		});
	};

	const handleNumberOfRows = (value: number) => {
		changeQuery({ newRows: value, resetPagination: true });
	};

	const changeQuery = (
		params: {
			field?: JobOrderField$options;
			direction?: OrderDirection$options;
			newRows?: number;
			after?: string;
			before?: string;
			resetPagination?: boolean;
			newFilter?: string;
		} = {}
	) => {
		changeParams({
			direction: params.direction || orderDirection,
			field: params.field || orderField,
			rows: params.newRows?.toString() || rows.toString(),
			before: params.resetPagination ? '' : (params.before ?? before),
			after: params.resetPagination ? '' : (params.after ?? after),
			filter: params.newFilter ?? filter,
			environments: Object.keys(views)
				.filter((key) => {
					return views[key];
				})
				.join(',')
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
						changeQuery({ newFilter: filter });
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
							changeQuery({ newFilter: '' });
						}}
					/>
				</form>
			</div>
			<div class="jobs-list">
				<div class="jobs-header">
					<div class="jobs-count">
						<BodyShort size="small" style="font-weight: bold;">
							{jobs.pageInfo.totalCount} jobs
							{jobs.pageInfo.totalCount !== $Jobs.data.team.totalJobs.pageInfo.totalCount
								? `(of total ${$Jobs.data.team.totalJobs.pageInfo.totalCount})`
								: ''}
						</BodyShort>
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
										{#if orderDirection === OrderDirection.ASC}
											<SortAscendingIcon size="1rem" />
										{:else}
											<SortDescendingIcon size="1rem" />
										{/if}
									{/snippet}
									<span style="display: flex; align-items: center; gap: 8px;">
										{orderField === JobOrderField.NAME
											? 'Name'
											: orderField === JobOrderField.STATUS
												? 'Status'
												: orderField === JobOrderField.ENVIRONMENT
													? 'Environment'
													: 'Deployed'}
										<ChevronDownIcon aria-hidden="true" height="20px" width="20px" />
									</span>
								</Button>
							{/snippet}
							{#key orderField}
								<ActionMenuRadioGroup value={orderField} label="Order by">
									<ActionMenuRadioItem
										value={JobOrderField.NAME}
										onselect={(value) => handleSortField(value as string)}>Name</ActionMenuRadioItem
									>
									<ActionMenuRadioItem
										value={JobOrderField.STATUS}
										onselect={(value) => handleSortField(value as string)}
										>Status</ActionMenuRadioItem
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
							{/key}
							<ActionMenuDivider />
							{#key orderDirection}
								<ActionMenuRadioGroup value={orderDirection} label="Direction">
									{#if orderField === JobOrderField.DEPLOYMENT_TIME}
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
							{#if job.deployments.nodes.length > 0}
								{@const timestamp = job.deployments.nodes[0].createdAt}
								<Tooltip
									content="Last deploy - {format(timestamp, 'PPPP', {
										locale: enGB
									})}"
								>
									<div class="job-detail">
										<RocketIcon />
										<Detail><Time time={timestamp} distance={true} /></Detail>
									</div>
								</Tooltip>
							{/if}
							<div style="display: flex; gap: 4px; align-items: center; line-height: 0;">
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
						</div>
					</div>
				{/each}
			</div>
			<Pagination
				page={jobs.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: jobs.pageInfo.startCursor ?? '' });
						Jobs.loadPreviousPage({ last: rows });
					},
					loadNextPage: () => {
						changeQuery({ after: jobs.pageInfo.endCursor ?? '' });
						Jobs.loadNextPage({ first: rows });
					}
				}}
			/>
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
			background-color: var(--active-color);
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

			&:hover {
				background-color: var(--a-surface-subtle);
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
			min-width: 114px;
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
</style>
