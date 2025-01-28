<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { JobOrderField, OrderDirection } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import SortAscendingIcon from '$lib/icons/SortAscendingIcon.svelte';
	import SortDescendingIcon from '$lib/icons/SortDescendingIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, Button, Detail, Heading, Loader, Search } from '@nais/ds-svelte-community';
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
		ExternalLinkIcon,
		QuestionmarkIcon,
		RocketIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';
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

	let views: { [key: string]: boolean } = $state({});
	let filteredEnvs = $derived(initialEnvironments.split(','));

	let jobOrderField: keyof typeof JobOrderField = $state(JobOrderField.NAME);
	let jobOrderDirection: keyof typeof OrderDirection = $state(OrderDirection.DESC);

	$Jobs.data?.team.environments.forEach((env) => {
		if (filteredEnvs.includes(env.name) || filteredEnvs[0] === '') {
			views[env.name] = true;
		} else {
			views[env.name] = false;
		}
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

	const handleFilter = () => {
		replaceState(page.url.toString(), {});
		const environments: string[] = Object.keys(views).filter((key) => {
			return views[key];
		});

		changeParams({
			direction: jobOrderDirection,
			field: jobOrderField,
			environments: environments.length > 0 ? environments.join(',') : '',
			filter: filter
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
		<BodyLong style="margin-bottom: 1rem;">
			A job is used for one-off or scheduled tasks meant to complete and then exit.<br />
			<a href="https://doc.nais.io/workloads/job/"
				>Learn more about jobs<ExternalLinkIcon title="NAIS documentation" /></a
			>
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
					placeholder="Filter jobs by name"
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
		<div class="jobs-wrapper">
			<div class="jobs-header">
				<div class="jobs-count">
					<Detail>{jobs.nodes.length} jobs</Detail>
				</div>
				<div>
					<ActionMenu>
						{#snippet trigger(props)}
							<Button variant="tertiary-neutral" size="small" iconPosition="right" {...props}>
								Environment
								{#snippet icon()}
									<ChevronDownIcon />
								{/snippet}
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
					{#if jobOrderDirection === OrderDirection.ASC}
						<SortAscendingIcon size="1rem" />
					{:else}
						<SortDescendingIcon size="1rem" />
					{/if}
					<ActionMenu>
						{#snippet trigger(props)}
							<Button variant="tertiary-neutral" size="small" iconPosition="right" {...props}>
								{#snippet icon()}
									<ChevronDownIcon aria-hidden="true" />
								{/snippet}
								{jobOrderField === JobOrderField.NAME
									? 'Name'
									: jobOrderField === JobOrderField.STATUS
										? 'Status'
										: jobOrderField === JobOrderField.ENVIRONMENT
											? 'Environment'
											: 'Deployed'}
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
								onselect={(value) => handleSortField(value as string)}>Deployed</ActionMenuRadioItem
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
					</ActionMenu>
				</div>
			</div>
			{#each jobs.nodes as job}
				<div class="jobs-list">
					<div>
						<Heading level="3" size="xsmall">{job.name}</Heading>
						<Detail>{job.environment.name}</Detail>
					</div>
					<div class="job-info">
						{#if job.runs.nodes[0]?.startTime}
							<div style="display: flex; gap: 4px; align-items: center;" title="Last run status">
								{#if job.runs.nodes[0].status.state === 'RUNNING'}
									<Loader size="xsmall" variant="interaction" />
								{:else if job.runs.nodes[0].status.state === 'PENDING'}
									<Loader size="xsmall" variant="interaction" />
								{:else if job.runs.nodes[0].status.state === 'SUCCEEDED'}
									<CheckmarkCircleFillIcon style="color: var(--a-icon-success)" />
								{:else if job.runs.nodes[0].status.state === 'FAILED'}
									<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" />
								{:else}
									<QuestionmarkIcon />
								{/if}
								<Detail><Time time={job.runs.nodes[0].startTime} distance={true} /></Detail>
							</div>
						{/if}
						{#if job.deploymentInfo.timestamp}
							<div class="job-detail">
								<RocketIcon title="Last deploy" />
								<Detail><Time time={job.deploymentInfo.timestamp} distance={true} /></Detail>
							</div>
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
							return await Jobs.loadPreviousPage();
						}}><ChevronLeftIcon /></Button
					>
					<Button
						size="small"
						variant="secondary"
						disabled={!jobs.pageInfo.hasNextPage}
						onclick={async () => {
							return await Jobs.loadNextPage();
						}}
					>
						<ChevronRightIcon /></Button
					>
				</span>
			</div>
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
	.jobs-wrapper {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;
		overflow: hidden;
		.jobs-header {
			background-color: var(--a-surface-subtle);
			border-bottom: 1px solid var(--a-border-default);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
		}
		.jobs-count {
			font-weight: bold;
		}
		.jobs-list {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--a-border-default);
			padding: 8px 12px;
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
