<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Table from '$lib/Table.svelte';
	import Time from '$lib/Time.svelte';
	import Sort from '$lib/icons/Sort.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Accessories from '../[env]/[app]/Accessories.svelte';
	import Status from '../[env]/[app]/Status.svelte';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);

	// Holds table sort state.  Initialized to reflect table sorted by id column ascending.
	let sortByApps = { col: 'name', ascending: true };
</script>

<Card>
	<h4>apper</h4>
	{#if $Workloads.data}
		<Table>
			<thead>
				<tr>
					<th>
						<button class="head">
							Workloads <Sort size="1.5rem" />
						</button>
					</th>
					<th>
						<button class="head"> Env <Sort size="1.5rem" /></button>
					</th>
					<th>
						<button class="head">
							Instances <Sort size="1.5rem" />
						</button>
					</th>
					<th>
						<button class="head">
							Deployed <Sort size="1.5rem" />
						</button>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each $Workloads.data.team.apps.edges as edge}
					<tr>
						<td
							><a href="/team/{teamName}/{edge.node.env.name}/{edge.node.name}">{edge.node.name}</a
							></td
						>
						<td>{edge.node.env.name}</td>
						<td>
							<Status app={edge.node} />
						</td>
						<td
							>{#if edge.node.deployed}
								<Time time={edge.node.deployed} distance={true} />
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/if}
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
