import { load_PostgresBackups } from '$houdini';
import { load } from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/backups/+page.js';

vi.mock('$houdini', () => ({ load_PostgresBackups: vi.fn(async () => ({})) }));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn(async () => ({})) }));

function event(viewerIsMember: boolean, isAdmin: boolean) {
	return {
		url: new URL('https://console.test/team/test/dev/postgres/database/backups?after=cursor'),
		params: { team: 'test', env: 'dev', postgres: 'database' },
		parent: async () => ({ viewerIsMember, isAdmin })
	} as Parameters<typeof load>[0];
}

beforeEach(() => vi.clearAllMocks());

test.each([false, true])(
	'rejects non-members before the query, even with admin=%s',
	async (admin) => {
		await expect(load(event(false, admin))).rejects.toMatchObject({ status: 403 });
		expect(load_PostgresBackups).not.toHaveBeenCalled();
	}
);

test('loads the requested backup page for team members', async () => {
	await load(event(true, false));
	expect(load_PostgresBackups).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({
			blocking: true,
			variables: { team: 'test', env: 'dev', name: 'database', after: 'cursor', first: 25 }
		})
	);
});
