import { requireMainBranch } from './branchCompatibility.js';
import { load as loadBranches } from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/branches/+page.js';
import { load as loadLayout } from '../../../routes/team/[team]/[env]/postgres/[postgres]/+layout.js';

describe('retired Postgres branch links', () => {
	test.each(['', '?branch=main'])('accepts default and explicit main: %s', async (search) => {
		const url = new URL(`https://console.test/team/test/dev/postgres/database${search}`);
		expect(() => requireMainBranch(url)).not.toThrow();
		await expect(
			loadLayout({
				url,
				route: { id: '/team/[team]/[env]/postgres/[postgres]/(single)' }
			} as Parameters<typeof loadLayout>[0])
		).resolves.toEqual({});
	});

	test.each(['preview', '', 'Main', 'main&branch=preview'])(
		'rejects unsupported branches: %s',
		(branch) => {
			const url = new URL(`https://console.test/?branch=${branch}`);
			expect(() => requireMainBranch(url)).toThrow(
				expect.objectContaining({
					status: 400,
					body: { message: expect.stringContaining('Only main is supported') }
				})
			);
		}
	);

	test.each(['', '?branch=main', '?branch=main&interval=6h'])(
		'redirects old branches route without a GraphQL query: %s',
		(search) => {
			const url = new URL(`https://console.test/team/test/dev/postgres/database/branches${search}`);
			expect(() => loadBranches({ url } as Parameters<typeof loadBranches>[0])).toThrow(
				expect.objectContaining({
					status: 307,
					location: `/team/test/dev/postgres/database${search.includes('interval') ? '?interval=6h' : ''}`
				})
			);
		}
	);

	test('does not redirect a non-main link to the main database', () => {
		const url = new URL(
			'https://console.test/team/test/dev/postgres/database/branches?branch=preview'
		);
		expect(() => loadBranches({ url } as Parameters<typeof loadBranches>[0])).toThrow(
			expect.objectContaining({ status: 400 })
		);
	});

	test.each(['', '/edit', '/delete', '/logs', '/insights', '/queries'])(
		'rejects non-main for every database view, including %s',
		async (suffix) => {
			const url = new URL(
				`https://console.test/team/test/dev/postgres/database${suffix}?branch=preview`
			);
			await expect(loadLayout({ url } as Parameters<typeof loadLayout>[0])).rejects.toMatchObject({
				status: 400
			});
		}
	);
});
