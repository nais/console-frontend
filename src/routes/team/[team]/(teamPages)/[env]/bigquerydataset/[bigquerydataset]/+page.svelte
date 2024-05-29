<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import BigQueryDataset from '$lib/icons/BigQuery.svelte';
	import { Alert, Link, Table, Tr, Td, Th } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { CheckmarkIcon, ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
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
		<Card columns={6}>
			<h3 class="heading">
				<BigQueryDataset />
				{bigQueryDatasetInstance.name}
			</h3>

			{#if bigQueryDatasetInstance.access.length}
				<Table>
					<Tr>
						<Th>Access</Th>
						<Th>Workload</Th>
						<Th>Type</Th>
					</Tr>
					{#each bigQueryDatasetInstance.access as access}
						<Tr>
							<!--							<Td>{access.role}</Td>-->
							<!--							<Td>-->
							<!--								<Link-->
							<!--									href="/team/{teamName}/{envName}/{access.workload.type === 'App'-->
							<!--										? 'app'-->
							<!--										: 'job'}/{access.workload.name}">{access.workload.name}</Link-->
							<!--								>-->
							<!--							</Td>-->
							<!--							<Td>{access.workload.type}</Td>-->
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
				<!--			{#if bigQueryDatasetInstance.status.conditions.length}
					{#each bigQueryDatasetInstance.status.conditions as cond}
						<dl class="conditions">
							<dt>Status</dt>
							<dd class="status">
								{#if cond.status === 'True'}
									{cond.type}
									<CheckmarkIcon
										style="color: var(&#45;&#45;a-surface-success); font-size: 1.5rem"
										title={cond.type}
									/>
								{:else}
									{cond.type}
									<ExclamationmarkTriangleFillIcon
										style="color: var(&#45;&#45;a-icon-info)"
										title={cond.type}
									/>
								{/if}
							</dd>
							<dt>Reason</dt>
							<dd>{cond.reason} (<Time time={cond.lastTransitionTime} />)</dd>
						</dl>
						<details>
							<summary>Status message</summary>
							<p style="width: 30em;">{cond.message}</p>
						</details>
					{/each}
				{:else}
					<p>No conditions</p>
				{/if}-->
			</div>
		</Card>
	</div>
{/if}

<style>
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
		gap: 1em;
		align-items: center;
	}
</style>
