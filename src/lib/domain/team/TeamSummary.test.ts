import { render } from 'svelte/server';
import TeamSummary from './TeamSummary.svelte';

describe('TeamSummary', () => {
	test.each([0, 2])(
		'labels %i urgent issue records without claiming a finding count',
		async (count) => {
			const { body } = await render(TeamSummary, {
				props: {
					teamSlug: 'test-team',
					vulnerabilityData: {
						team: {
							urgentVulnerabilityIssues: { pageInfo: { totalCount: count } }
						}
					}
				}
			});

			expect(body).toContain('Urgent issues');
			expect(body).not.toMatch(/>Urgent</);
			expect(body).toContain('href="/team/test-team/vulnerabilities"');
			expect(body).toMatch(new RegExp(`<span[^>]*class="metric-value[^"]*"[^>]*>${count}</span>`));
		}
	);
});
