<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { Link, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import { page } from '$app/stores';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Images } = data);
	$: images = $Images.data?.team.images.nodes;
</script>

<Card columns={12}>
	<Table>
		<Thead>
		<Th>Image</Th>
		<Th>Critical</Th>
		<Th>Risk score</Th>
		<Th>Workloads</Th>
		</Thead>
		<Tbody>

		{#if images !== undefined}
			{#each images as image}
				<Tr>
					<Td>
						<Link href={`/team/${teamName}/images/${image.latestProjectId}`}>{image.name}
						</Link>
					</Td>
					<Td>{image.critical}</Td>
					<Td>{image.riskScore}</Td>
					<Td>
						{#each image.projects as project}
							{project.team}:{project.environment}:{project.application}<br />
						{/each}
					</Td>
				</Tr>
			{/each}
		{/if}
		</Tbody>
	</Table>
</Card>