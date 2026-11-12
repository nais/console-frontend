import { describe, expect, it } from 'vitest';
import { grafanaTimeRangeURL, teamLogsURL } from './logLinks.js';
import { resolveLogRange } from './loki.js';

const range = resolveLogRange(15, '', '', Date.parse('2026-11-09T12:00:00.123Z'));

describe('external log links', () => {
	it('preserves Grafana workload filters while replacing the time range', () => {
		const href =
			'https://grafana.example.com/a/grafana-lokiexplore-app/explore/service/app/logs?var-ds=Logs&var-filters=service_name|%3D|app&var-filters=service_namespace|%3D|team&from=now-1h&to=now';
		const url = new URL(grafanaTimeRangeURL(href, range));
		expect(url.pathname).toBe(new URL(href).pathname);
		expect(url.searchParams.get('var-ds')).toBe('Logs');
		expect(url.searchParams.getAll('var-filters')).toEqual([
			'service_name|=|app',
			'service_namespace|=|team'
		]);
		expect(url.searchParams.getAll('from')).toEqual(['1794224700123']);
		expect(url.searchParams.getAll('to')).toEqual(['1794225600123']);
	});

	it('keeps the original Grafana link before a query has run', () => {
		const href = 'https://grafana.example.com/logs?var-ds=Logs';
		expect(grafanaTimeRangeURL(href)).toBe(href);
	});

	it('preserves the APM traces tab while adding the time range', () => {
		const url = new URL(
			grafanaTimeRangeURL(
				'https://grafana.example.com/a/nais-apm-app/services/team/app?tab=traces',
				range
			)
		);
		expect(url.pathname).toBe('/a/nais-apm-app/services/team/app');
		expect(url.searchParams.get('tab')).toBe('traces');
		expect(url.searchParams.get('from')).toBe('1794224700123');
		expect(url.searchParams.get('to')).toBe('1794225600123');
	});

	it('adds explicit timestamp bounds to the Team Logs workload query', () => {
		const url = new URL(teamLogsURL('project', 'team', 'app', range));
		expect(url.searchParams.get('project')).toBe('project');
		expect(decodeURIComponent(url.pathname.split(';query=')[1])).toBe(
			'resource.labels.namespace_name="team"\nresource.labels.container_name="app"\n' +
				'timestamp >= "2026-11-09T11:45:00.123Z"\n' +
				'timestamp <= "2026-11-09T12:00:00.123Z"'
		);
	});
});
