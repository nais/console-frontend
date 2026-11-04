import type {
	ReconcilerFragment,
	ReconcilerFragment$data,
	SaveReconcilerConfig$input
} from '$houdini';
import { flushSync, mount, unmount } from 'svelte';
import { afterEach, expect, it, vi } from 'vitest';
import Reconciler from './Reconciler.svelte';

const { mutateConfig } = vi.hoisted(() => ({
	mutateConfig: vi
		.fn<(variables: SaveReconcilerConfig$input) => Promise<{ errors: null }>>()
		.mockResolvedValue({ errors: null })
}));

vi.mock('$houdini', async () => {
	const { readable } = await import('svelte/store');
	return {
		fragment: () => readable(reconcilerData),
		graphql: (query: string) => ({
			mutate: query.includes('SaveReconcilerConfig') ? mutateConfig : vi.fn()
		})
	};
});

const reconcilerData: ReconcilerFragment$data = {
	id: 'example',
	name: 'example',
	displayName: 'Example reconciler',
	description: 'Example configuration',
	configured: true,
	enabled: true,
	errors: { pageInfo: { totalCount: 0 } },
	config: [
		{
			key: 'interval',
			displayName: 'Interval',
			description: 'Synchronization interval',
			value: 'original',
			configured: true,
			secret: false
		},
		{
			key: 'token',
			displayName: 'Token',
			description: 'An already configured secret',
			value: null,
			configured: true,
			secret: true
		}
	]
};

let component: ReturnType<typeof Reconciler> | undefined;

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
	vi.clearAllMocks();
});

it('submits reconciler configuration when Save is clicked without resubmitting unchanged secrets', async () => {
	const reconciler: ReconcilerFragment = { ' $fragments': { ReconcilerFragment: {} } };
	component = mount(Reconciler, { target: document.body, props: { reconciler } });
	flushSync();
	const configuration = [...document.querySelectorAll<HTMLButtonElement>('button')].find(
		(button) => button.textContent?.trim() === 'Configuration'
	);
	if (!configuration) throw new Error('Missing configuration toggle');
	configuration.click();
	flushSync();
	const form = document.querySelector('form');
	const input = form?.querySelector<HTMLInputElement>('input');
	const save = form?.querySelector<HTMLButtonElement>('button');
	if (!input || !save) throw new Error('Missing configuration form controls');
	expect(save.textContent?.trim()).toBe('Save');
	expect(save.type).toBe('submit');
	input.value = 'updated';
	input.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
	save.click();
	await vi.waitFor(() => {
		expect(mutateConfig).toHaveBeenCalledOnce();
		expect(mutateConfig).toHaveBeenCalledWith({
			name: 'example',
			config: [{ key: 'interval', value: 'updated' }]
		});
	});
});
