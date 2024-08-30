<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { mergeCalculateAndSortOverageDataAllTeams } from '$lib/utils/resources';
	import { Table, Tbody, Td, Th, Thead, Tr, type TableSortState } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Highscores } = data);

	$: resourceUtilization = $Highscores.data;

	$: overageTable = mergeCalculateAndSortOverageDataAllTeams(
		resourceUtilization,
		sortState.orderBy,
		sortState.direction
	);

	let sortState: TableSortState = {
		orderBy: 'COST',
		direction: 'descending'
	};
</script>

<div>
	<h1>High scores</h1>
	<Card>
		<h2>Top 10 overage cost</h2>
		<Table size={'small'} zebraStripes>
			<Thead>
				<Tr>
					<Th>Rank</Th>
					<Th>Team</Th>
					<Th>Unused CPU</Th>
					<Th>Unused memory</Th>
					<Th>Estimated annual overage cost</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each overageTable as overage, i}
					<Tr>
						<Td>{i + 1}</Td>
						<Td>
							{overage.name}
						</Td>
						<Td
							>{overage.unusedCpu.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}</Td
						>
						<Td>{prettyBytes(overage.unusedMem)}</Td>
						<Td
							>{overage.estimatedAnnualOverageCost > 0.0
								? euroValueFormatter(overage.estimatedAnnualOverageCost)
								: '€0.00'}</Td
						>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</Card>
</div>
