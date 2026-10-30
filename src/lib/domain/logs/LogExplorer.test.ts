import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import LogExplorer from './LogExplorer.svelte';

const props = {
	team: 'team',
	environment: 'dev-gcp',
	tenant: 'nav',
	workload: 'app',
	instances: [],
	hasLoki: true
};

describe('LogExplorer', () => {
	it('shows automatic filter controls without a manual run button', async () => {
		const { body } = await render(LogExplorer, { props });
		expect(body).toContain('Search log content');
		expect(body).toContain('Time range');
		expect(body).toContain('aria-label="Previous time range"');
		expect(body).toContain('aria-label="Next time range"');
		expect(body).toContain('aria-label="Jump to now"');
		expect(body).toContain('Last 15 seconds');
		expect(body).toContain('Last 10 minutes');
		expect(body).toContain('Last 7 days');
		expect(body).toContain('Lines per page');
		expect(body).not.toContain('Edit LogQL');
		expect(body).toContain('Refresh');
		expect(body).toContain('Settings');
		expect(body).toContain('Show query');
		expect(body).toContain('aria-label="Log settings"');
		expect(body).toContain('aria-hidden="true"');
		expect(body).not.toContain('Run query');
		expect(body).not.toContain('Use filters');
		expect(body).not.toContain('LogQL editor');
		expect(body).not.toContain('Generated LogQL');
		expect(body).not.toContain('Match instance name prefix');
	});

	it('does not show query controls without a Loki destination', async () => {
		const { body } = await render(LogExplorer, { props: { ...props, hasLoki: false } });
		expect(body).toContain('This workload has no Loki log destination.');
		expect(body).not.toContain('Search log content');
	});

	it('places Show query in Settings rather than the filter toolbar', async () => {
		const { body } = await render(LogExplorer, { props });
		const start = body.indexOf('aria-label="Log settings"');
		const end = body.indexOf('Close settings', start);
		expect(start).toBeGreaterThan(-1);
		expect(end).toBeGreaterThan(start);
		expect(body.slice(0, start)).not.toContain('Show query');
		expect(body.slice(start, end)).toContain('Show query');
	});

	it('keeps an inaccessible, disabled Cancel button in its reserved slot while idle', async () => {
		const { body } = await render(LogExplorer, { props });
		const start = body.search(/<span[^>]*class="[^"]*\bcancel-slot\b[^"]*"/);
		expect(start).toBeGreaterThan(-1);
		const slot = body.slice(start, body.indexOf('</button>', start));
		expect(slot).toMatch(/class="[^"]*\bidle\b/);
		expect(slot).toContain('aria-hidden="true"');
		expect(slot).toMatch(/<button[^>]*\bdisabled(?:=|\s|>)/);
		expect(slot).toContain('Cancel');
	});

	it('accepts a job-run prefix without exposing a prefix matching setting', async () => {
		const { body } = await render(LogExplorer, {
			props: { ...props, initialInstance: 'job-run-123', initialInstanceIsPrefix: true }
		});
		expect(body).toContain('value="job-run-123"');
		expect(body).toContain('placeholder="All instances"');
		expect(body).not.toContain('Match instance name prefix');
		expect(body).not.toContain('Instance prefix');
	});
});
