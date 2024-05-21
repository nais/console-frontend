<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';

	export let data: PageData;

	$: team = $page.params.team;
	$: ({ Images } = data);
	$: images = $Images.data?.team.images;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Images.variables));

	$: console.log(images);

	function getTag(name: string) {
		const split = name.split('/');
		return split[split.length - 1];
	}
</script>

<Card columns={12}>
	<h2>Images - {team}</h2>
	<Table
		size="small"
		sort={sortState}
		on:sortChange={(e) => {
			const { key } = e.detail;
			const ss = sortTable(key, sortState);
			changeParams({ col: ss.orderBy, dir: tableGraphDirection[ss.direction] });
		}}
	>
		<Thead>
			<Th sortable={true} sortKey="NAME">Image</Th>
			<Th sortable={true} sortKey="SEVERITY_CRITICAL">Critical</Th>
			<Th sortable={true} sortKey="RISK_SCORE">Risk score</Th>
			<Th>Workloads</Th>
		</Thead>
		<Tbody>
			{#if images !== undefined}
				{#each images.nodes as image}
					<Tr>
						<Td>
							<span
								style="width: 100%; direction: rtl; text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
								title={image.name}
							>
								<a href="/team/{team}/images/{image.projectId}"
									>{getTag(image.name)}:{image.version}</a
								></span
							>
						</Td>
						<Td style="text-align: center">{image.critical}</Td>
						<Td style="text-align: center">{image.riskScore}</Td>
						<Td>
							{#if image.workloadReferences.length > 0}
								{#each image.workloadReferences as workload}
									<a href={`/team/${team}/${workload.environment}/app/${workload.name}`}
										>{workload.team}:{workload.environment}:{workload.name}</a
									><br />
								{/each}
							{:else}
								<span>No workloads</span>
							{/if}
						</Td>
					</Tr>
				{/each}
			{/if}
		</Tbody>
	</Table>
	<Pagination
		pageInfo={images?.pageInfo}
		{limit}
		{offset}
		changePage={(e) => {
			changeParams({ page: e.toString() });
		}}
	/>
</Card>
