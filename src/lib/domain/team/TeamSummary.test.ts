import { render } from 'svelte/server';
import TeamSummary from './TeamSummary.svelte';

describe('TeamSummary', () => {
	test('links to vulnerabilities without reporting a retired Urgent count', async () => {
		const { body } = await render(TeamSummary, { props: { teamSlug: 'test-team' } });

		expect(body).not.toContain('Urgent issues');
		expect(body).toContain('href="/team/test-team/vulnerabilities"');
		expect(body).toContain('View vulnerabilities');
	});
});
