<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import BigQueryDataset from '$lib/icons/BigQuery.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import {
		CopyButton,
		HelpText,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ BigQueryDataset: BigQueryDatasetInstance } = data);
	$: bigQueryDatasetInstance = $BigQueryDatasetInstance.data?.team.bigQueryDataset;
	$: teamName = $page.params.team;
</script>

{#if $BigQueryDatasetInstance.errors}
	<GraphErrors errors={$BigQueryDatasetInstance.errors} />
{:else if bigQueryDatasetInstance && bigQueryDatasetInstance.name !== PendingValue}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				<BigQueryDataset />
				{bigQueryDatasetInstance.name}
			</h3>

			<em>{bigQueryDatasetInstance.description}</em>

			<h4 style="margin: 1em 0 0 0;"><CostIcon size="16" /> Cost</h4>
			<p style="margin-left: 1em; margin-top: 0;">
				€{Math.round(bigQueryDatasetInstance.cost)} last 30 days
			</p>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<p style="margin-left: 1em; margin-top: 0;">
				{#if bigQueryDatasetInstance.workload}
					<WorkloadLink
						workload={bigQueryDatasetInstance.workload}
						env={bigQueryDatasetInstance.env.name}
						team={teamName}
					/>
				{:else}
					<div class="inline">
						<i>No owner</i>
						<ExclamationmarkTriangleFillIcon
							style="color: var(--a-icon-warning)"
							title="This Big Query instance does not belong to any workload"
						/>
					</div>
				{/if}
			</p>

			<dl class="status">
				<dt>Created</dt>
				<dd><Time time={bigQueryDatasetInstance.status.creationTime} /></dd>

				<dt>Last modified</dt>
				<dd>
					<Time
						time={bigQueryDatasetInstance.status.lastModifiedTime ||
							bigQueryDatasetInstance.status.creationTime}
					/>
				</dd>

				<dt>
					Cascading delete
					<HelpText title="Current memory utilization"
						>if true, deleting the application will also delete the dataset and all its tables.
					</HelpText>
				</dt>
				<dd>
					{#if bigQueryDatasetInstance.cascadingDelete}
						<CheckmarkIcon style="color: var(--a-surface-success)" title="CascadingDelete" />
					{:else}
						<Tooltip content={bigQueryDatasetInstance.cascadingDelete.toString()} placement="right">
							<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
						</Tooltip>
					{/if}
				</dd>
			</dl>
		</Card>
		<Card columns={5} rows={2}>
			<h3>Status</h3>
			<div>
				{#if bigQueryDatasetInstance.status.conditions.length}
					{#each bigQueryDatasetInstance.status.conditions as cond}
						<dl class="conditions">
							<dt>Status</dt>
							<dd class="status">
								{#if cond.status === 'True'}
									{cond.type}
									<CheckmarkIcon
										style="color: var(--a-surface-success); font-size: 1.5rem"
										title={cond.type}
									/>
								{:else}
									{cond.type}
									<ExclamationmarkTriangleFillIcon
										style="color: var(--a-icon-info)"
										title={cond.type}
									/>
								{/if}
							</dd>
							<dt>Reason</dt>
							<dd>{cond.reason} (<Time time={cond.lastTransitionTime} />)</dd>
						</dl>
						<details>
							<summary>Status message</summary>
							<p style="max-width: 25em;">{cond.message}</p>
						</details>
					{/each}
				{:else}
					<p>No conditions</p>
				{/if}
			</div>
		</Card>
		<Card columns={7}>
			<h3>Access</h3>

			{#if bigQueryDatasetInstance.access.length}
				<Table size="small" zebraStripes>
					<Thead>
						<Tr>
							<Th>Access</Th>
							<Th>ServiceAccount</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each bigQueryDatasetInstance.access as access}
							<Tr>
								<Td>{access.role}</Td>
								<Td
									><div class="email">
										<span title={access.email}>{access.email}</span>
										<CopyButton size="xsmall" variant="action" copyText={access.email} />
									</div>
								</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			{:else}
				<p>no workloads with configured access</p>
			{/if}
		</Card>
	</div>
{/if}

<style>
	.email {
		display: grid;
		grid-template-columns: 1fr 60px;
	}
	.email span {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.heading {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	dl.status {
		display: grid;
		align-items: center;
		grid-template-columns: 30% 70%;
	}

	dl.conditions {
		display: grid;
		align-items: center;
		grid-template-columns: 20% 80%;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	div dl.conditions:not(:first-child) {
		margin-top: 3em;
	}

	dt {
		font-weight: bold;
		display: flex;
		gap: 0.5em;
		align-items: center;
	}
	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
