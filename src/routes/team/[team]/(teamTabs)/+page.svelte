<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Table from '$lib/Table.svelte';
	import Sort from '$lib/icons/Sort.svelte';
	import Accessories from '../[env]/[app]/Accessories.svelte';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);

	let apps = [
		{ name: 'appen', env: 'dev', instances: '4/4', notification: '' },
		{ name: 'appto', env: 'dev', instances: '3/4', notification: 'alert' },
		{ name: 'apptre', env: 'dev', instances: '5/5', notification: '' },
		{ name: 'appfire', env: 'prod', instances: '6/6', notification: '' },
		{ name: 'appfem', env: 'ci', instances: '2/2', notification: '' },
		{ name: 'appseks', env: 'prod', instances: '1/1', notification: '' }
	];
	const jobs = [
		{ name: 'jobben', env: 'dev', status: 'running', notification: 'alert' },
		{ name: 'jobbto', env: 'dev', status: 'completed', notification: '' },
		{ name: 'jobbtre', env: 'dev', status: 'completed', notification: '' }
	];

	// Holds table sort state.  Initialized to reflect table sorted by id column ascending.
	let sortByApps = { col: 'name', ascending: true };

	$: sort = (column: string) => {
		if (sortByApps.col == column) {
			sortByApps.ascending = !sortByApps.ascending;
		} else {
			sortByApps.col = column;
			sortByApps.ascending = true;
		}

		// Modifier to sorting function for ascending or descending
		let sortModifier = sortByApps.ascending ? 1 : -1;

		let sort = (a: any, b: any) =>
			a[column] < b[column] ? -1 * sortModifier : a[column] > b[column] ? 1 * sortModifier : 0;

		apps = apps.sort(sort);
	};
	$: console.log($Workloads.data);
</script>

<Card>
	<h4>apper</h4>
	{#if $Workloads.data}
		<Table>
			<thead>
				<tr>
					<th>
						<button class="head" on:click={() => sort('name')}>
							Workloads <Sort size="1.5rem" />
						</button>
					</th>
					<th>
						<button class="head" on:click={() => sort('env')}> Env <Sort size="1.5rem" /></button>
					</th>
					<th>
						<button class="head" on:click={() => sort('instances')}>
							Instances <Sort size="1.5rem" />
						</button>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each $Workloads.data.team.apps.edges as edge}
					{@debug edge}
					<tr>
						<td
							><a href="/team/{teamName}/{edge.node.env.name}/{edge.node.name}">{edge.node.name}</a
							></td
						>
						<td>{edge.node.env.name}</td>
						<td
							>{edge.node.instances.filter((i) => i.status === 'Running').length} / {edge.node
								.instances.length}</td
						>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/if}
</Card>
<br />
<Card>
	<h4>Jobs</h4>
	<Table>
		<thead>
			<tr>
				<th><button class="head">Workloads <Sort size="1.5rem" /></button></th>
				<th><button class="head">Env <Sort size="1.5rem" /></button></th>
				<th><button class="head">Status <Sort size="1.5rem" /></button></th>
				<th><button class="head">Notification <Sort size="1.5rem" /></button></th>
			</tr>
		</thead>
		<tbody>
			{#each jobs as job}
				<tr>
					<td><a href="/team/{teamName}/{job.env}/job/{job.name}">{job.name}</a></td>
					<td>{job.env}</td>
					<td>{job.status}</td>
					<td>{job.notification}</td>
				</tr>
			{/each}
		</tbody>
	</Table>
</Card>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: var(--a-bg-default);
		border: none;
		font-size: 1rem;
		font-weight: 500;
		color: var(--a-text-default);
		cursor: pointer;
	}
	.head:hover {
		color: var(--a-text-subtle);
	}
	th {
		text-align: left;
		padding-left: 1rem;
	}
</style>
