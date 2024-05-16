<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { Link, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Images } = data);
	$: images = $Images.data?.team.images.nodes;
</script>

<Card columns={12}>
	<h2>Images - {teamName}</h2>
	<Table size="small">
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
							<Link href={`/team/${teamName}/images/${image.id}`}
								><span
									style="width: 100%; direction: rtl; text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
									title={image.name}>{image.name}</span
								></Link
							>
						</Td>
						<Td>{image.critical}</Td>
						<Td>{image.riskScore}</Td>
						<Td>N/A</Td>
					</Tr>
				{/each}
			{/if}
		</Tbody>
	</Table>
</Card>
