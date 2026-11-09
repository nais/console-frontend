import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Logs from '../../../routes/team/[team]/[env]/app/[app]/logs/Logs.svelte';
import JobLogs from '../../../routes/team/[team]/[env]/job/[job]/logs/JobLogs.svelte';

const matchMedia = vi.hoisted(() => {
	const mock = vi.fn(() => ({
		matches: false,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	}));
	vi.stubGlobal('matchMedia', mock);
	return mock;
});

vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/logs'),
		params: { team: 'team', app: 'app', job: 'app' },
		data: { tenantName: 'nav' }
	}
}));
vi.mock('$houdini', () => ({ JobRunState: { RUNNING: 'RUNNING' } }));

let component: ReturnType<typeof Logs> | ReturnType<typeof JobLogs> | undefined;

beforeEach(() => {
	vi.stubGlobal('matchMedia', matchMedia);
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		}
	);
});

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

function assertLinkRanges() {
	const links = [...document.querySelectorAll<HTMLAnchorElement>('.detail-actions a')];
	const grafana = links.find((link) => link.textContent?.trim() === 'Open Grafana');
	const teamLogs = links.find((link) => link.textContent?.trim() === 'Open Team Logs');
	const traces = links.find((link) => link.textContent?.trim() === 'Open traces');
	expect(grafana).toBeDefined();
	expect(teamLogs).toBeDefined();
	expect(traces).toBeDefined();
	expect(grafana!.closest('[aria-label="Log settings"]')).toBeNull();
	expect(teamLogs!.closest('[aria-label="Log settings"]')).toBeNull();
	expect(traces!.closest('[aria-label="Log settings"]')).toBeNull();

	const grafanaURL = new URL(grafana!.href);
	const from = Number(grafanaURL.searchParams.get('from'));
	const to = Number(grafanaURL.searchParams.get('to'));
	const tracesURL = new URL(traces!.href);
	expect(tracesURL.pathname).toBe('/a/nais-apm-app/services/team/app');
	expect(tracesURL.searchParams.get('tab')).toBe('traces');
	expect(tracesURL.searchParams.get('from')).toBe(String(from));
	expect(tracesURL.searchParams.get('to')).toBe(String(to));
	const query = decodeURIComponent(new URL(teamLogs!.href).pathname.split(';query=')[1]);
	expect(query).toContain(`timestamp >= "${new Date(from).toISOString()}"`);
	expect(query).toContain(`timestamp <= "${new Date(to).toISOString()}"`);

	const request = vi
		.mocked(fetch)
		.mock.calls.map(([url]) => new URL(String(url), 'https://console.example.com'))
		.findLast(
			(url) =>
				url.pathname.endsWith('/query_range') && !url.searchParams.get('query')?.startsWith('sum(')
		);
	expect(request?.searchParams.get('start')).toBe(String(BigInt(from) * 1_000_000n));
	expect(request?.searchParams.get('end')).toBe(String(BigInt(to) * 1_000_000n));
	return { from, to };
}

it.each(['application', 'job'] as const)(
	'keeps all %s links visible and synchronized through time navigation and custom ranges',
	async (kind) => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async (input: string) => {
				const url = new URL(input, 'https://console.example.com');
				const volume = url.searchParams.get('query')?.startsWith('sum(');
				const resultType = volume
					? url.pathname.endsWith('/query_range')
						? 'matrix'
						: 'vector'
					: 'streams';
				return new Response(
					JSON.stringify({ status: 'success', data: { resultType, result: [] } })
				);
			})
		);
		const workload = {
			name: 'app',
			logDestinations: [
				{
					id: 'loki',
					__typename: 'LogDestinationLoki' as const,
					grafanaURL:
						'https://grafana.example.com/a/grafana-lokiexplore-app/explore/service/app/logs?var-ds=Logs'
				},
				{ id: 'secure', __typename: 'LogDestinationSecureLogs' as const }
			],
			instances: { nodes: [] },
			runs: { nodes: [] }
		};
		const props = {
			team: {
				slug: 'team',
				environment: {
					gcpProjectID: 'project',
					environment: { name: 'dev-gcp' },
					application: workload,
					job: workload
				}
			}
		};
		component =
			kind === 'application'
				? mount(Logs, { target: document.body, props })
				: mount(JobLogs, { target: document.body, props });
		flushSync();
		await vi.waitFor(() => expect(document.body.textContent).toContain('No logs match'));
		expect(
			document.body.textContent?.match(/No logs match this query and time range\./g)
		).toHaveLength(1);
		expect(document.querySelector('.overlay-content')).not.toBeNull();
		expect(document.querySelector('[role="alert"]')).toBeNull();
		const initial = assertLinkRanges();
		expect(initial.to - initial.from).toBe(15 * 60_000);

		document.querySelector<HTMLButtonElement>('[aria-label="Previous time range"]')!.click();
		flushSync();
		const previous = assertLinkRanges();
		expect(previous.to).toBe(initial.from);
		expect(previous.to - previous.from).toBe(initial.to - initial.from);

		const select = document.querySelector<HTMLSelectElement>(
			'[aria-label="Time navigation"] select'
		)!;
		select.value = 'custom';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		flushSync();
		const inputs = [...document.querySelectorAll<HTMLInputElement>('input[type="datetime-local"]')];
		expect(inputs).toHaveLength(2);
		inputs[0].value = '2026-01-02T10:00:00.123';
		inputs[1].value = '2026-01-02T11:30:00.456';
		for (const input of inputs) input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		await vi.waitFor(() => {
			const custom = assertLinkRanges();
			expect(custom.from).toBe(new Date(inputs[0].value).getTime());
			expect(custom.to).toBe(new Date(inputs[1].value).getTime());
		});
	}
);
