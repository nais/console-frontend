<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Table from '$lib/Table.svelte';
	import Sort from '$lib/icons/Sort.svelte';
	$: team = $page.params.team;

	const apps = [
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
</script>

<Card>
	<h4>apper</h4>
	<Table>
		<thead>
			<tr>
				<th><div class="head">Workloads <Sort size="1.5rem" /></div></th>
				<th><div class="head">Env <Sort size="1.5rem" /></div></th>
				<th><div class="head">Instances <Sort size="1.5rem" /></div></th>
				<th><div class="head">Status <Sort size="1.5rem" /></div></th>
			</tr>
		</thead>
		<tbody>
			{#each apps as app}
				<tr>
					<td><a href="/team/{team}/{app.env}/{app.name}">{app.name}</a></td>
					<td>{app.env}</td>
					<td>{app.instances}</td>
					<td>{app.notification}</td>
				</tr>
			{/each}
		</tbody>
	</Table>
</Card>
<br />
<Card>
	<h4>Jobs</h4>
	<Table>
		<thead>
			<tr>
				<th><div class="head">Workloads <Sort size="1.5rem" /></div></th>
				<th><div class="head">Env <Sort size="1.5rem" /></div></th>
				<th><div class="head">Status <Sort size="1.5rem" /></div></th>
				<th><div class="head">Notification <Sort size="1.5rem" /></div></th>
			</tr>
		</thead>
		<tbody>
			{#each jobs as job}
				<tr>
					<td><a href="/team/{team}/{job.env}/job/{job.name}">{job.name}</a></td>
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
	}
	th {
		text-align: left;
		padding-left: 1rem;
	}
</style>
