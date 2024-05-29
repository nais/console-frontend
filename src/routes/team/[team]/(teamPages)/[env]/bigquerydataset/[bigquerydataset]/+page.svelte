<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import BigQueryDataset from '$lib/icons/BigQuery.svelte';
	import {
		CopyButton,
		Tooltip,
		Alert,
		Link,
		Table,
		Tr,
		Td,
		Th,
		HelpText
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import {
		XMarkIcon,
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon
	} from '@nais/ds-svelte-community/icons';
	import Time from '$lib/Time.svelte';

	export let data: PageData;
	$: ({ BigQueryDataset: BigQueryDatasetInstance } = data);
	$: bigQueryDatasetInstance = $BigQueryDatasetInstance.data?.team.bigQueryDataset;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;
</script>

{#if $BigQueryDatasetInstance.errors}
	{#each $BigQueryDatasetInstance.errors as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{JSON.stringify(error)}
		</Alert>
	{/each}
{:else if bigQueryDatasetInstance && bigQueryDatasetInstance.name !== PendingValue}
	<div class="grid">
		<Card columns={6} rows={2}>
			<h3 class="heading">
				<BigQueryDataset />
				{bigQueryDatasetInstance.name}
			</h3>
			<em>{bigQueryDatasetInstance.description}</em>
			<dl class="status">
				<dt>Created</dt>
				<dd><Time time={bigQueryDatasetInstance.status.creationTime || new Date()} /></dd>
				<dt>Last modified</dt>
				<dd>
					<Time
						time={bigQueryDatasetInstance.status.lastModifiedTime ||
							bigQueryDatasetInstance.status.creationTime ||
							new Date()}
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
		<Card columns={6}>
			<h3>Access</h3>

			{#if bigQueryDatasetInstance.access.length}
				<Table>
					<Tr>
						<Th>Access</Th>
						<Th>ServiceAccount</Th>
					</Tr>
					{#each bigQueryDatasetInstance.access as access}
						<Tr>
							<Td>{access.role}</Td>
							<Td
								><div class="email">
									<span title={access.email}>{access.email}</span>
									<CopyButton size="small" variant="action" copyText={access.email} />
								</div>
							</Td>
						</Tr>
					{/each}
				</Table>
			{:else}
				<p>no workloads with configured access</p>
			{/if}
		</Card>
		<Card columns={6}>
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
							<p style="max-width: 30em;">{cond.message}</p>
						</details>
					{/each}
				{:else}
					<p>No conditions</p>
				{/if}
			</div>
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
</style>
