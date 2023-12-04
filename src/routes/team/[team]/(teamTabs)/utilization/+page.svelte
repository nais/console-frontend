<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageTeamTransformLineChart,
		resourceUtilizationCPUOverageTransformLineChart,
		resourceUtilizationMemoryOverageTransformLineChart
	} from '$lib/chart/resource_usage_team_transformers';
	import type { Overage, Utilization } from '$lib/chart/types';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { euroValueFormatter } from '$lib/utils/currency';
	import { overageTableData } from '$lib/utils/resources';
	import type { TableSortState } from '@nais/ds-svelte-community';
	import {
		Accordion,
		AccordionItem,
		Alert,
		HelpText,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForTeam } = data);

	$: overageCostForTeam = $ResourceUtilizationForTeam.data?.resourceUtilizationOverageForTeam;
	$: resourceUtilization = $ResourceUtilizationForTeam.data?.resourceUtilizationForTeam;
	$: currentResourceUtilizationForTeam =
		$ResourceUtilizationForTeam.data?.currentResourceUtilizationForTeam;
	$: overageTable = overageTableData(overageCostForTeam, sortState.orderBy, sortState.direction);

	$: minDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.from;
	$: maxDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.to;

	$: min =
		minDate && minDate !== PendingValue
			? minDate.toISOString().split('T')[0]
			: new Date(Date.now() - 7 * 1000 * 24 * 60 * 60).toISOString().split('T')[0];
	$: max =
		maxDate && maxDate !== PendingValue
			? maxDate.toISOString().split('T')[0]
			: new Date(Date.now()).toISOString().split('T')[0];

	$: team = $page.params.team;

	function echartOptionsUsageChart(data: Utilization) {
		const opts = resourceUsageTeamTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsCPUOverageChart(data: Overage[]) {
		const opts = resourceUtilizationCPUOverageTransformLineChart(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsMemoryOverageChart(data: Overage[]) {
		const opts = resourceUtilizationMemoryOverageTransformLineChart(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	let from = data.fromDate?.toISOString().split('T')[0];
	let to = data.toDate?.toISOString().split('T')[0];

	const sortTable = (key: string, sortState: TableSortState) => {
		if (!sortState) {
			sortState = {
				orderBy: key,
				direction: 'descending'
			};
		} else if (sortState.orderBy === key) {
			if (sortState.direction === 'ascending') {
				sortState.direction = 'descending';
			} else {
				sortState.direction = 'ascending';
			}
		} else {
			sortState.orderBy = key;
			if (key === 'NAME') {
				sortState.direction = 'ascending';
			} else {
				sortState.direction = 'descending';
			}
		}

		overageTable = overageTableData(overageCostForTeam, sortState.orderBy, sortState.direction);
		return sortState;
	};

	$: {
		if (maxDate && maxDate !== PendingValue) {
			if (data.toDate > maxDate) {
				from = new Date(maxDate.getTime() - 7 * 1000 * 24 * 60 * 60).toISOString().split('T')[0];
				to = max;
				update();
			}
		}
	}

	let sortState: TableSortState = {
		orderBy: 'COST',
		direction: 'descending'
	};
</script>

{#if $ResourceUtilizationForTeam.errors}
	<Alert variant="error">
		{#each $ResourceUtilizationForTeam.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
<div class="grid">
	{#if overageCostForTeam && resourceUtilization && currentResourceUtilizationForTeam}
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #83bff6">
					<CpuIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>
						CPU utilization<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour for team {team}.
							{#if currentResourceUtilizationForTeam !== undefined && currentResourceUtilizationForTeam.cpu !== PendingValue}
								<br />Last updated <Time
									distance={true}
									time={currentResourceUtilizationForTeam.cpu.timestamp}
								/>
							{/if}
						</HelpText>
					</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.cpu !== PendingValue}
							{currentResourceUtilizationForTeam.cpu.utilization.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {currentResourceUtilizationForTeam.cpu.request.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})} CPUs
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<MemoryIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Memory utilization<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour for team {team}.
							{#if currentResourceUtilizationForTeam !== undefined && currentResourceUtilizationForTeam.memory !== PendingValue}
								<br />Last updated <Time
									distance={true}
									time={currentResourceUtilizationForTeam.memory.timestamp}
								/>
							{/if}
						</HelpText>
					</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.memory !== PendingValue}
							{currentResourceUtilizationForTeam?.memory.utilization.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {prettyBytes(currentResourceUtilizationForTeam?.memory.request)}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard" style="--bg-color: #83bff6">
				<div class="summaryIcon">
					<CostIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>
						Cost of unused CPU<HelpText title="Annual cost of unused CPU"
							>Estimate of annual cost of unused CPU for team {team} calculated from utilization data
							for the last elapsed hour.
							{#if currentResourceUtilizationForTeam !== undefined && currentResourceUtilizationForTeam.cpu !== PendingValue}
								<br />Last updated <Time
									distance={true}
									time={currentResourceUtilizationForTeam.cpu.timestamp}
								/>
							{/if}
						</HelpText>
					</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.memory !== PendingValue}
							€{currentResourceUtilizationForTeam.cpu.estimatedAnnualOverageCost > 0.0
								? currentResourceUtilizationForTeam.cpu.estimatedAnnualOverageCost.toLocaleString(
										'en-GB',
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										}
								  )
								: '0.00'}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost of unused memory<HelpText placement={'left'} title="Annual cost of unused memory"
							>Estimate of annual cost of unused memory for team {team} calculated from utilization data
							for the last elapsed hour.
							{#if currentResourceUtilizationForTeam !== undefined && currentResourceUtilizationForTeam.memory !== PendingValue}
								<br />Last updated <Time
									distance={true}
									time={currentResourceUtilizationForTeam.memory.timestamp}
								/>
							{/if}
						</HelpText>
					</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.memory !== PendingValue}
							€{currentResourceUtilizationForTeam.memory.estimatedAnnualOverageCost > 0.0
								? currentResourceUtilizationForTeam.memory.estimatedAnnualOverageCost.toLocaleString(
										'en-GB',
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										}
								  )
								: '0.00'}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={12} borderColor="var(--a-gray-200)">
			<div style="display: flex; justify-content: space-between;">
				<h3>Unused resources per application</h3>
				{#if overageCostForTeam !== PendingValue && overageCostForTeam.timestamp !== null}
					<p style="text-align: right; color: var(--a-text-subtle)">
						Last updated: <Time time={overageCostForTeam.timestamp} distance={true} />
					</p>
				{:else}
					<p>Laste updated: <Skeleton variant="text" /></p>
				{/if}
			</div>

			<div style="display: flex">
				{#if overageCostForTeam === PendingValue}
					<div class="loading">
						<Skeleton variant="rectangle" />
					</div>
				{:else}
					<EChart
						options={echartOptionsCPUOverageChart(overageCostForTeam.cpu)}
						style="height: 350px; width: 50%;"
						on:click={(e) => {
							const [env, app] = e.detail.name.split(':');
							goto(`/team/${team}/${env}/app/${app}/utilization`);
						}}
					/>
				{/if}

				{#if overageCostForTeam === PendingValue}
					<div class="loading" style="width: 50%;">
						<Skeleton variant="rectangle" />
					</div>
				{:else}
					<EChart
						options={echartOptionsMemoryOverageChart(overageCostForTeam.memory)}
						style="height: 350px; width: 50%;"
						on:click={(e) => {
							const [env, app] = e.detail.name.split(':');
							goto(`/team/${team}/${env}/app/${app}/utilization`);
						}}
					/>
				{/if}
			</div>
			<div>
				<Accordion>
					<Accordion>
						<AccordionItem heading="All applications" open={false}>
							<Table
								size={'small'}
								sort={sortState}
								on:sortChange={(e) => {
									const { key } = e.detail;
									sortState = sortTable(key, sortState);
								}}
							>
								<Thead>
									<Tr>
										<Th sortable={true} sortKey="APPLICATION">Application</Th>
										<Th sortable={true} sortKey="ENVIRONMENT">Environment</Th>
										<Th sortable={true} sortKey="CPU">Unused CPU</Th>
										<Th sortable={true} sortKey="MEMORY">Unused memory</Th>
										<Th sortable={true} sortKey="COST">Estimated annual overage cost</Th>
									</Tr>
								</Thead>
								<Tbody>
									{#if overageCostForTeam === PendingValue}
										<div class="loading">
											<Skeleton variant="rectangle" />
										</div>
									{:else}
										{#each overageTable as overage}
											<Tr>
												<Td>
													<a href={`/team/${team}/${overage.env}/app/${overage.app}/utilization`}>
														{overage.app}
													</a>
												</Td>
												<Td>{overage.env}</Td>
												<Td
													>{overage.cpu > 0.0
														? overage.cpu.toLocaleString('en-GB', {
																minimumFractionDigits: 2,
																maximumFractionDigits: 2
														  })
														: '-'}</Td
												>
												<Td>{overage.memory > 0.0 ? prettyBytes(overage.memory) : '-'}</Td>
												<Td
													>{overage.estimatedAnnualOverageCost > 0.0
														? euroValueFormatter(overage.estimatedAnnualOverageCost)
														: '€0.00'}</Td
												>
											</Tr>
										{:else}
											<p>No overage data for team {team}</p>
										{/each}
									{/if}
								</Tbody>
							</Table>
						</AccordionItem>
					</Accordion>
				</Accordion>
			</div>
		</Card>
		<Card columns={12}>
			<h3>Resource utilization per environment</h3>
			<div class="datepicker">
				<label for="from">From:</label>
				<input type="date" id="from" {min} max={to} bind:value={from} on:change={update} />
				<label for="to">To:</label>
				<input type="date" id="to" min={from} {max} bind:value={to} on:change={update} />
			</div>
			{#each resourceUtilization as env}
				{#if env.env !== PendingValue}
					<h4>Resource utilization in {env.env}</h4>
				{/if}
				{#if env.env === PendingValue}
					<div class="loading" style="width: 100%;">
						<Skeleton variant="rectangle" />
					</div>
				{:else if env.cpu.length === 0}
					<p>No utilization data for team {team} in {env.env}</p>
				{:else}
					<EChart options={echartOptionsUsageChart(env)} style="height: 400px" />
				{/if}
			{/each}
		</Card>
	{/if}
</div>

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.datepicker {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	.loading {
		height: 400px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.summaryIcon {
		display: flex;
		background-color: color-mix(in srgb, var(--bg-color) 10%, white);
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 2px solid var(--bg-color);
		border-radius: 5px;
	}
	.summary > h4 {
		display: flex;
		gap: 0.5rem;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
	.metric {
		font-size: 1.5rem;
		margin: 0;
	}
	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
</style>
