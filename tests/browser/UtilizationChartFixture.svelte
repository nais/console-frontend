<script lang="ts">
	import UtilizationChart from '../../src/lib/chart/UtilizationChart.svelte';
	import Theme from '../../src/lib/shadcn/ui/Theme.svelte';

	const params = new URLSearchParams(window.location.search);
	const memoryTeams = [
		'teamdokumenthandtering',
		'teamkuhr',
		'eessibasis',
		'klage',
		'isa',
		'teamfamilie',
		'bidrag',
		'pensjonopptjening',
		'team-inntekt',
		'long-team-name-that-needs-truncating'
	];
	const cpuTeams = [
		'teampam',
		'aap',
		'bidrag',
		'k9saksbehandling',
		'teamfrikort',
		'teamdagpenger',
		'teamfamilie',
		'pensjonopptjening',
		'pensjonselvbetjening',
		'okonomi'
	];
	const cpu = cpuTeams.map((key, index) => ({ key, overage: 100 - index * 10 }));
	const memory = memoryTeams.map((key, index) => ({ key, overage: (100 - index * 10) * 1e9 }));
	let selectedTeam = $state('');
</script>

<Theme theme={params.has('dark') ? 'dark' : 'light'}>
	<div class="charts">
		<div data-testid="cpu-chart"><UtilizationChart data={cpu} format="cpu" /></div>
		<div data-testid="memory-chart">
			<UtilizationChart
				data={memory}
				format="memory"
				onBarClick={({ key }) => (selectedTeam = key)}
			/>
		</div>
	</div>
	<p>Content following the charts must not overlap their labels.</p>
	<output aria-label="Selected team">{selectedTeam}</output>
</Theme>

<style>
	.charts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-auto-rows: var(--utilization-chart-height);
		max-width: var(--page-max-width);
		margin: auto;
	}
	.charts > div {
		width: 100%;
		min-width: 0;
	}
	@media (max-width: 767px) {
		.charts {
			grid-template-columns: 1fr;
		}
	}
</style>
