<script>
	import Card from '$lib/Card.svelte';
	import Table from '$lib/Table.svelte';
	import { deployments } from '$lib/mock/deployments';
	import { timeAgo } from '$lib/timeAgo';
</script>

<Card>
	<h3>Deploys</h3>
	<Table>
		<thead>
			<tr>
				<th>Resource(s)</th>
				<th>Created</th>
				<th>Cluster</th>
				<th>Status</th>
				<th>Links</th>
			</tr>
		</thead>
		<tbody>
			{#each deployments as deployment}
				{#each deployment.resources as resource}
					<tr>
						<td>{resource.name}/{resource.kind}</td>
						<td>{deployment.deployment.created}</td>
						<td>{deployment.deployment.cluster}</td>
						<td>{deployment.statuses[0].status}</td>
						<td>
							{#if deployment.deployment.githubRepository}
								<a href="https://github.com/{deployment.deployment.githubRepository}"
									>{deployment.deployment.githubRepository}</a
								>
							{/if}
						</td>
					</tr>
				{/each}
			{/each}
		</tbody>
	</Table>
</Card>

<style>
	thead tr th {
		padding-left: 1rem;
	}
</style>
