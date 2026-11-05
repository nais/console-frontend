<script lang="ts">
	import Loader from '../../src/lib/shadcn/ui/Loader.svelte';
	import Heading from '../../src/lib/shadcn/ui/Heading.svelte';
	import AddToFavorites from '../../src/lib/ui/AddToFavorites.svelte';
	import CriticalIndicator from '../../src/lib/ui/CriticalIndicator.svelte';
	import Theme from '../../src/lib/shadcn/ui/Theme.svelte';
	import Button from '../../src/lib/shadcn/ui/Button.svelte';
	import ActionMenu from '../../src/lib/shadcn/ui/ActionMenu.svelte';
	import ActionMenuItem from '../../src/lib/shadcn/ui/ActionMenuItem.svelte';
	import Modal from '../../src/lib/shadcn/ui/Modal.svelte';
	import Tooltip from '../../src/lib/shadcn/ui/Tooltip.svelte';
	import JobRunListItem from '../../src/lib/domain/list-items/JobRunListItem.svelte';
	import FavoritesListItem from '../../src/lib/domain/list-items/FavoritesListItem.svelte';
	import LogResults from '../../src/lib/domain/logs/LogResults.svelte';
	import LogVolume from '../../src/lib/domain/logs/LogVolume.svelte';
	import Badge from '../../src/lib/shadcn/ui/Badge.svelte';
	import Input from '../../src/lib/shadcn/ui/Input.svelte';
	import Tag from '../../src/lib/shadcn/ui/Tag.svelte';
	import Td from '../../src/lib/shadcn/ui/Td.svelte';
	import Th from '../../src/lib/shadcn/ui/Th.svelte';
	import Tr from '../../src/lib/shadcn/ui/Tr.svelte';
	import Collection from '../../src/lib/ui/Collection.svelte';
	import EmptyState from '../../src/lib/ui/EmptyState.svelte';
	import ExternalLink from '../../src/lib/ui/ExternalLink.svelte';
	import PriorityAlertBar from '../../src/lib/domain/vulnerability/PriorityAlertBar.svelte';
	import TeamSummary from '../../src/lib/domain/team/TeamSummary.svelte';
	import ResourceTable from '../../src/lib/ui/ResourceTable.svelte';
	import CostChart from '../../src/lib/chart/CostChart.svelte';
	import CostAreaChart from '../../src/lib/chart/CostAreaChart.svelte';
	import SearchField from '../../src/lib/ui/SearchField.svelte';
	import SbomStatusIcon from '../../src/lib/domain/vulnerability/SbomStatusIcon.svelte';
	import PersistenceItem from '../../src/lib/domain/persistence/PersistenceItem.svelte';
	import StaticUtilizationDonut from '../../src/lib/chart/StaticUtilizationDonut.svelte';
	import type { TeamSummaryCost$result } from '$houdini';

	const sizes = ['3xlarge', '2xlarge', 'xlarge', 'large', 'medium', 'small', 'xsmall'] as const;
	const headingSizes = ['xlarge', 'large', 'medium', 'small', 'xsmall'] as const;
	const statusVariants = ['success', 'warning', 'destructive', 'info'] as const;
	let nestedTheme = $state<'light' | 'dark'>('light');
	let dialogOpen = $state(false);
	let deletedRun = $state('');
	let selectedLogFilter = $state('');
	const showFavoriteDrag = new URLSearchParams(window.location.search).has('favorite-drag');
	const showCostFormatting = new URLSearchParams(window.location.search).has('cost-formatting');
	const showUtilization = new URLSearchParams(window.location.search).has('utilization');
	const utilizationCases = [
		{ key: 'zero', value: 0 },
		{ key: 'missing', value: null },
		{ key: 'undefined', value: undefined },
		{ key: 'low', value: 1 },
		{ key: 'partial', value: 50 },
		{ key: 'warning', value: 80 },
		{ key: 'full', value: 100 }
	];

	const costCases = [
		{ key: 'decreasing', sum: 96 },
		{ key: 'threshold', sum: 105 },
		{ key: 'increasing', sum: 106 }
	];

	function costData(currentSum: number): TeamSummaryCost$result {
		const now = new Date();
		return {
			team: {
				cost: {
					daily: {
						series: [
							{ date: new Date(now.getFullYear(), now.getMonth() - 1, 1), sum: 100 },
							{ date: new Date(now.getFullYear(), now.getMonth(), 1), sum: currentSum }
						]
					}
				}
			}
		};
	}
</script>

<main>
	{#if showUtilization}
		<section data-testid="utilization-gauges" aria-label="Utilization gauges">
			{#each utilizationCases as utilization (utilization.key)}
				<div data-testid="utilization-{utilization.key}">
					<StaticUtilizationDonut value={utilization.value} label="CPU" />
				</div>
			{/each}
		</section>
	{/if}
	{#if showCostFormatting}
		<div data-testid="cost-area-legend">
			<CostAreaChart
				data={[
					{
						date: new Date(2026, 9, 1),
						'Compute Engine': 20,
						'Cloud Storage': 0.0002,
						'Secret Manager': -0.000002
					},
					{
						date: new Date(2026, 9, 2),
						'Compute Engine': 80,
						'Cloud Storage': 0.0008,
						'Secret Manager': -0.000008
					},
					{
						date: new Date(2026, 9, 3),
						'Compute Engine': 100,
						'Cloud Storage': 0.001,
						'Secret Manager': -0.00001
					}
				]}
			/>
		</div>
		{#each [1, 1000, 1000000, 0.001, 0.00001] as maximum (maximum)}
			<div data-testid="cost-area-{maximum}">
				<CostAreaChart
					data={[
						{ date: new Date(2026, 9, 1), Service: maximum * 0.2 },
						{ date: new Date(2026, 9, 2), Service: maximum * 0.8 },
						{ date: new Date(2026, 9, 3), Service: maximum }
					]}
				/>
			</div>
		{/each}
		<div class="cost-line-fixture" data-testid="cost-line" style="height: 300px">
			<CostChart
				class="cost-line-inner"
				data={[
					{ date: new Date(2026, 9, 1), cost: 0.0024 },
					{ date: new Date(2026, 9, 2), cost: 0.0024 },
					{ date: new Date(2026, 9, 3), cost: 0.0024 }
				]}
				dateField="date"
				valueField="cost"
			/>
		</div>
	{/if}
	{#if showFavoriteDrag}
		<FavoritesListItem path="/team/drag-fixture" />
	{/if}
	<LogResults
		entries={[
			{
				timestamp: '1793360657408654616',
				message: 'Tooltip regression log',
				labels: {
					detected_level: 'info',
					k8s_node_name: 'node-with-a-long-name-for-horizontal-scrolling-regression',
					service_name: 'fixture-app'
				}
			}
		]}
		wrap={false}
		oldestFirst={false}
		onfilter={(filter) => (selectedLogFilter = `${filter.name}${filter.operator}${filter.value}`)}
	/>
	<output aria-label="Selected log filter">{selectedLogFilter}</output>
	<LogVolume
		buckets={[{ start: 1793360600000, end: 1793360660000, count: 42 }]}
		onselect={() => {}}
	/>
	<Collection title="Job runs" count={1}>
		<JobRunListItem
			run={{
				name: 'fixture-run',
				startTime: null,
				duration: 82,
				status: { state: 'SUCCEEDED', message: 'Succeeded' },
				trigger: { type: 'AUTOMATIC', actor: null }
			}}
			ondelete={(name) => (deletedRun = name)}
		/>
	</Collection>
	<output aria-label="Run selected for deletion">{deletedRun}</output>
	<Collection title="Activity tooltip regression">
		<Tooltip content="Kubernetes audit">
			<span>Audit event</span>
		</Tooltip>
	</Collection>
	<AddToFavorites path="/team/feedback-fixture" />
	{#each sizes as size (size)}
		<Loader {size} title={`Loading ${size}`} />
	{/each}
	<Loader title="Styled loading" size="large" style="color: var(--ax-text-accent)" />
	<section aria-label="Readable controls">
		<Input ariaLabel="Readability search" placeholder="Search resources" />
		<span data-testid="critical-dot" aria-hidden="true"><CriticalIndicator /></span>
		{#each statusVariants as variant (variant)}
			<Badge {variant} size="sm">{variant} badge</Badge>
			<Tag variant={variant === 'destructive' ? 'error' : variant} size="small">{variant} tag</Tag>
		{/each}
		<Badge variant="env-dev" size="sm" mono>dev-gcp</Badge>
		<ResourceTable label="Readability table">
			{#snippet header()}<Th>Resource</Th><Th>Last updated</Th>{/snippet}
			<Tr>
				<Td>Example resource</Td>
				<Td><span class="table-meta">Recently updated</span></Td>
			</Tr>
		</ResourceTable>
	</section>
	<section aria-label="Token sizing">
		<SearchField label="Token search" value="cache" />
		<span data-testid="sbom-size">
			<SbomStatusIcon indicator="no-sbom" label="No SBOM available" />
		</span>
		<div class="table-scroll" data-testid="persistence-size">
			<PersistenceItem persistence={{ __typename: 'Valkey', name: 'Example cache' }} />
		</div>
		<div data-testid="loading-card">
			<TeamSummary teamSlug="token-fixture" loading />
		</div>
	</section>
	{#each headingSizes as size (size)}
		<Heading as="h2" {size} spacing>{size} heading</Heading>
	{/each}
	<Theme theme="light" data-testid="light-reference">Light reference</Theme>
	<Theme theme="dark" data-testid="dark-parent">
		<Theme data-testid="inherited-dark">Inherited dark theme</Theme>
		<Theme theme={nestedTheme} data-testid="nested-theme">
			<Theme data-testid="inherited-theme">Inherited nested theme</Theme>
			<Theme theme="dark" data-testid="nested-dark">Explicit dark descendant</Theme>
			<ActionMenu>
				{#snippet trigger(props)}<Button {...props}>Nested theme actions</Button>{/snippet}
				<ActionMenuItem>Nested theme action</ActionMenuItem>
			</ActionMenu>
			<Button onclick={() => (dialogOpen = true)}>Open themed dialog</Button>
			<Modal bind:open={dialogOpen} header="Themed dialog">
				<Button onclick={() => (nestedTheme = nestedTheme === 'light' ? 'dark' : 'light')}>
					Toggle dialog theme
				</Button>
				<Tooltip content="Dialog tooltip">
					<Button>Dialog tooltip target</Button>
				</Tooltip>
			</Modal>
		</Theme>
	</Theme>
	<section aria-label="Cost sparklines">
		{#each costCases as costCase (costCase.key)}
			<div data-testid={`cost-${costCase.key}`}>
				<TeamSummary teamSlug="cost-fixture" costData={costData(costCase.sum)} />
			</div>
		{/each}
	</section>
	<section aria-label="Priority colours">
		<PriorityAlertBar knownExploited={31} high={162} elevated={99} monitor={1092} />
		<PriorityAlertBar knownExploited={31} high={162} elevated={99} monitor={1092} compact />
	</section>
	<Collection title="Cloud SQL" count={0}>
		<EmptyState
			title="No Cloud SQL instances found."
			description="Cloud SQL instances provide managed relational databases in the cloud."
		>
			<ExternalLink href="https://docs.nais.io/persistence/cloudsql">
				Learn more about Cloud SQL in Nais and how to get started.
			</ExternalLink>
		</EmptyState>
	</Collection>
	<Collection title="Applications" count={0}>
		<EmptyState title="No applications found." />
	</Collection>
	<Collection title="Jobs" count={0}>
		<EmptyState title="No jobs match your filters." />
	</Collection>
	<section aria-labelledby="resource-issues-heading">
		<Heading as="h2" id="resource-issues-heading">Issues</Heading>
		<Collection headerless>
			<EmptyState title="No issues found" />
		</Collection>
	</section>
</main>

<style>
	.cost-line-fixture :global(.cost-line-inner) {
		height: 100%;
	}
</style>
