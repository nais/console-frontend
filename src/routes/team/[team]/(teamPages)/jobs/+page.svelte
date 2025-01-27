<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyLong, Button, Detail, Heading, Loader } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental.js';
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
	let { Jobs, teamSlug } = $derived(data);

	// example code from doc
	let views: { [key: string]: boolean } = $state({});

	$Jobs.data?.team.environments.forEach((env) => {
		views[env.name] = true;
	});

	/*let rows = $state(25);
	 */
	const handleCheckboxChange = (checkboxId: string, checked: boolean) => {
		console.log(checkboxId, checked);
		if (checkboxId === '*') {
			Object.keys(views).forEach((key) => {
				views[key] = checked;
			});
		} else {
			views[checkboxId] = checked;
		}
		handleFilter();
	};

	const handleFilter = () => {
		replaceState(page.url.toString(), {});
		const environments: string[] = Object.keys(views).filter((key) => {
			return views[key];
		});
		Jobs.fetch({ variables: { team: teamSlug, filter: { name: '', environments } } });

		changeParams({
			//direction: tableSort.direction || 'DESC',
			//field: tableSort.orderBy || JobOrderField.STATUS,
			environments: environments.length > 0 ? environments.join(',') : []
			//filter: freetext
		});
	};
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
		</div>
		<BodyLong style="margin-bottom: 1rem;">
			A job is used for one-off or scheduled tasks meant to complete and then exit. Learn more about
			jobs.<br />
			<a href="https://doc.nais.io/workloads/job/"
				>Learn more about jobs<ExternalLinkIcon title="NAIS documentation" /></a
			>
		</BodyLong>
		<div style="border: 1px solid var(--a-border-default); border-radius: 4px; overflow: hidden;">
			<div
				style="background-color: var(--a-surface-subtle); border-bottom: 1px solid var(--a-border-default); display: flex; justify-content: space-between; align-items: center; padding: 8px 12px;"
			>
				<Detail style="font-weight: bold;">{jobs.nodes.length} jobs</Detail>
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

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
