import { render } from 'svelte/server';
import { vi } from 'vitest';
import DeploymentText from './shared/texts/DeploymentActivityLogEntryText.svelte';
import type { ActivityLogEntry } from './shared/texts/types';

const fixture = vi.hoisted(() => ({ legacyDeployDisabled: false }));

vi.mock('$app/state', () => ({ page: { data: fixture } }));
vi.mock('$app/env', () => ({ browser: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));

test.each([false, true])(
	'keeps deployment activity but gates the history link (%s)',
	async (disabled) => {
		fixture.legacyDeployDisabled = disabled;
		const data = {
			id: 'entry',
			actor: 'deployer',
			createdAt: new Date('2026-11-19T12:00:00Z'),
			teamSlug: 'team',
			environmentName: 'dev',
			resourceName: 'app',
			resourceType: 'APP',
			deploymentData: { triggerURL: 'https://example.com/123' }
		} as ActivityLogEntry<'DeploymentActivityLogEntry'>;
		const { body } = await render(DeploymentText, { props: { data } });
		expect(body).toContain('Deployed');
		expect(body).toContain('deployer');
		expect(body).toContain('href="/team/team/dev/app/app"');
		if (disabled) {
			expect(body).not.toContain('/deploys');
		} else {
			expect(body).toContain('/deploys?deployId=123');
		}
	}
);
