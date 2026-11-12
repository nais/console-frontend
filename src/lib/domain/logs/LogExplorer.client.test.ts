import { flushSync, mount, unmount } from 'svelte';
import { afterEach, expect, it, vi } from 'vitest';
import LogExplorer from './LogExplorer.svelte';
import { fetchLogPage, fetchLogVolume } from './loki.js';

vi.mock('./loki.js', async (original) => ({
	...(await original<typeof import('./loki.js')>()),
	fetchLogPage: vi.fn(),
	fetchLogVolume: vi.fn()
}));
vi.mock('./LogVolume.svelte', () => ({ default: vi.fn() }));
vi.mock('./LogResults.svelte', () => ({ default: vi.fn() }));

let component: ReturnType<typeof LogExplorer> | undefined;

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
	vi.resetAllMocks();
});

it.each([undefined, 'opaque-postgres-id'])(
	'forwards Postgres ID %s to log, volume and older-page requests without physical pod scoping',
	async (postgresId) => {
		vi.mocked(fetchLogPage).mockResolvedValue({ entries: [], nextEnd: '100', warnings: [] });
		vi.mocked(fetchLogVolume).mockResolvedValue({ buckets: [], warnings: [] });
		component = mount(LogExplorer, {
			target: document.body,
			props: {
				team: 'team',
				environment: 'dev-gcp',
				tenant: 'nav',
				workload: 'database',
				container: 'postgres',
				instances: [],
				postgresId,
				hasLoki: true
			}
		});
		flushSync();
		await vi.waitFor(() => expect(fetchLogPage).toHaveBeenCalledTimes(1));
		await vi.waitFor(() => expect(document.body.textContent).toContain('Load older logs'));
		flushSync();
		const query = vi.mocked(fetchLogPage).mock.calls[0][0].query;
		expect(query).toContain('service_namespace="team",service_name="database"');
		expect(query).toContain('k8s_container_name=~"^(?:postgres)$"');
		expect(query).not.toContain('k8s_pod_name');
		expect(fetchLogPage).toHaveBeenCalledWith(expect.objectContaining({ postgresId }));
		expect(fetchLogVolume).toHaveBeenCalledWith(expect.objectContaining({ query, postgresId }));

		const older = [...document.querySelectorAll('button')].find((button) =>
			button.textContent?.includes('Load older logs')
		);
		expect(older).toBeDefined();
		older!.click();
		flushSync();
		await vi.waitFor(() => expect(fetchLogPage).toHaveBeenCalledTimes(2));
		expect(fetchLogPage).toHaveBeenLastCalledWith(
			expect.objectContaining({ query, end: '100', postgresId })
		);
	}
);
