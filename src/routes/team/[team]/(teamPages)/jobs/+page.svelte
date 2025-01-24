<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { JobOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import FilteredInput, {
		type AppliedFilter,
		type Filter
	} from '$lib/components/FilteredInput/FilteredInput.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import {
		Button,
		Detail,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuGroup,
		ActionMenuItem
	} from '@nais/ds-svelte-community/experimental.js';
	import {
		BriefcaseClockIcon,
		CheckmarkCircleFillIcon,
		CheckmarkCircleIcon,
		CheckmarkIcon,
		ChevronDownIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		CircleBrokenIcon,
		MenuElipsisVerticalIcon,
		QuestionmarkIcon,
		RocketIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Jobs, teamSlug } = $derived(data);

	let filter: string = $state('');

	const handleFilter = () => {
		replaceState(page.url.toString(), {});
		const environments = filters.filter((f) => f.key === 'environment')?.map((f) => f.value);
		Jobs.fetch({ variables: { team: teamSlug, filter: { name: freetext, environments } } });
		changeParams({
			direction: tableSort.direction || 'DESC',
			field: tableSort.orderBy || JobOrderField.STATUS,
			environments: environments.join(','),
			filter: freetext
		});
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleFilter();
			return;
		} else if (e.key === 'Escape') {
			filter = '';
			handleFilter();
			return;
		}
	};

	let tableSort = $derived({
		orderBy: $Jobs.variables?.orderBy?.field,
		direction: $Jobs.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = JobOrderField[key as keyof typeof JobOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || JobOrderField.NAME,
			environments: filters
				.filter((f) => f.key === 'environment')
				?.map((f) => f.value)
				.join(','),
			filter: freetext
		});
	};

	let filters: AppliedFilter[] = $state([]);
	let freetext: string = $state('');
	let supportedFilters: Filter[] = $derived([
		{
			key: 'environment',
			values: $Jobs.data?.team.environments
				.filter(
					(env) =>
						filters
							.filter((f) => f.key === 'environment')
							?.map((f) => f.value)
							.indexOf(env.name) === -1
				)
				.map((env) => ({ value: env.name }))
		}
	]);
</script>

<GraphErrors errors={$Jobs.errors} />

{#if $Jobs.data}
	{@const jobs = $Jobs.data.team.jobs}
	<Card columns={12}>
		<div class="header">
			<div style="display: flex; align-items: center; width: 50%; gap: 4px;">
				<BriefcaseClockIcon width="32px" height="32px" />
				<h3 style="margin: 0px;">Jobs</h3>
			</div>
			<div style="width:50%">
				<FilteredInput
					bind:filters
					bind:value={filter}
					bind:freetext
					{supportedFilters}
					onkeyup={onKeyUp}
					placeholder="Filter jobs"
				/>
			</div>
		</div>

		<div style="border: 1px solid var(--a-border-default); border-radius: 4px; overflow: hidden;">
			<div
				style="
				background-color: var(--a-surface-subtle);
				border-bottom: 1px solid var(--a-border-default);
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 8px 12px;"
			>
				<Detail style="font-weight: bold;">{jobs.nodes.length} jobs</Detail>
				{#snippet trigger(props: any)}
					<Button variant="tertiary-neutral" size="small" iconPosition="right" {...props}>
						Environment
						{#snippet icon()}
							<ChevronDownIcon />
						{/snippet}
					</Button>
				{/snippet}
				<ActionMenu {trigger}>
					{#each $Jobs.data.team.environments as env}
						<ActionMenuItem
							onSelect={() => {
								console.log('selected', env.name);
								filters.push({ key: 'environment', value: env.name });
							}}
						>
							{#snippet icon()}
								<CheckmarkIcon />
							{/snippet}
							{env.name}
						</ActionMenuItem>
					{/each}
				</ActionMenu>
			</div>
			{#each jobs.nodes as job}
				<div
					style="
					display: flex; 
					justify-content: space-between; 
					align-items: center; border-bottom: 1px solid var(--a-border-default); padding: 8px 12px;"
				>
					<div>
						<Heading level="3" size="xsmall">{job.name}</Heading>
						<Detail>{job.environment.name}</Detail>
					</div>
					<div style="min-width: 110px; display: flex; gap: 4px; flex-direction: column;">
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
							<div style="display: flex; gap: 4px; align-items: center;">
								<RocketIcon title="Last deploy" />
								<Detail><Time time={job.deploymentInfo.timestamp} distance={true} /></Detail>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- <Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || JobOrderField.STATUS,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={JobOrderField.STATUS} style="width: 2rem"></Th>
					<Th sortable={true} sortKey={JobOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={JobOrderField.ENVIRONMENT} style="width: 10rem"
						>Environment</Th
					>
					<Th sortable={true} sortKey={JobOrderField.DEPLOYMENT_TIME} style="width: 150px"
						>Deployed</Th
					>
				</Tr>
			</Thead>
			<Tbody>
				{#if jobs !== undefined}
					{#each jobs.nodes as job}
						<Tr>
							<Td>
								<div class="status">
									<a
										href="/team/{teamSlug}/{job.environment.name}/job/{job.name}/status"
										data-sveltekit-preload-data="off"
									>
										<StatusBadge size="1.5rem" state={job.status.state} />
									</a>
								</div>
							</Td>
							<Td>
								<a href="/team/{teamSlug}/{job.environment.name}/job/{job.name}">{job.name}</a>
							</Td>
							<Td>{job.environment.name}</Td>

							<Td>
								{#if job.deploymentInfo.timestamp}
									<Time time={job.deploymentInfo.timestamp} distance={true} />
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No jobs found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table> -->
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
	}

	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
