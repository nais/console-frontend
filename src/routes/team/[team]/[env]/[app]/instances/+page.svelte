<script>
	import { page } from '$app/stores';
	import { appSpec } from '$lib/mock/appSpec';
	import Card from '$lib/Card.svelte';
	import Table from '$lib/Table.svelte';
	$: app = $page.params.app;
	$: env = $page.params.env;
</script>

<Card>
	<h3>Instances of {app} in {env}</h3>
	<Table>
		<thead>
			<tr>
				<th>Instance</th>
				<th>status</th>
				<th>reason</th>
			</tr>
		</thead>
		<tbody>
			{#each appSpec.instances as instance}
				<tr>
					<td>{instance.name}</td>
					<td>{instance.status}</td>
					<td>{instance.reason || ''}</td>
				</tr>
			{/each}
		</tbody>
	</Table>

	<p>2 running</p>
	<p>Min. 2 / Max 8 <a href="/">Adjust</a></p>
</Card>
