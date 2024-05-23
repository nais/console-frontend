<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	import { PendingValue } from '$houdini';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { severityToColor } from '$lib/utils/vulnerabilities';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Images } = data);
	$: team = $Images.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Images.variables));

	function getTag(name: string) {
		const split = name.split('/');
		return split[split.length - 1];
	}
</script>

<Card columns={12}>
	<h2>Workload images</h2>
	<Table
		zebraStripes
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
			<Th sortable={true} sortKey="RISK_SCORE" style="width: 8rem;">Risk score</Th>
		</Thead>
		<Tbody>
			{#if team !== undefined && team.id !== PendingValue}
				{#each team.images.nodes as image}
					<Tr>
						<Td>
							<span
								style="width: 100%; direction: rtl; text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
								title={image.name}
							>
								<a href="/team/{teamName}/images/{image.projectId}"
									>{getTag(image.name)}:{image.version}</a
								></span
							>
						</Td>
						<Td style="text-align: center">
							<div class="badge">
								{#if image.summary.critical > 0}
									<Tooltip
										placement="right"
										content="{image.summary
											.critical} vulnerabilities found. Please update your dependencies!"
									>
										<VulnerabilityBadge
											text={String(image.summary.critical)}
											color={severityToColor('critical')}
											size={'32px'}
										/>
									</Tooltip>
								{:else}
									<Tooltip
										placement="right"
										content="No vulnerabilities found, keep up the good work!"
									>
										<code class="check">&check;</code>
									</Tooltip>
								{/if}
							</div>
						</Td>
						<Td style="text-align: center">{image.summary.riskScore}</Td>
					</Tr>
				{/each}
			{:else}
				{#each new Array(team?.images.nodes.length).fill('text') as variant}
					<Tr>
						<Td><Skeleton {variant} /></Td>
						<Td><Skeleton {variant} /></Td>
						<Td><Skeleton {variant} /></Td>
						<Td><Skeleton {variant} /></Td>
					</Tr>
				{/each}
			{/if}
		</Tbody>
	</Table>
	<div class="pagination">
		<Pagination
			pageInfo={team?.images.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</div>
</Card>

<style>
	.badge {
		display: flex;
		justify-content: center;
	}
	.pagination {
		margin-top: 1rem;
	}
	.check {
		font-size: 2rem;
		color: #4dbd74;
		text-align: center;
		padding-left: 4px;
	}
</style>
