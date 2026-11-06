import { createRawSnippet, flushSync, mount, unmount, type ComponentProps } from 'svelte';
import { afterEach, expect, it, vi } from 'vitest';
import SettingsLayout from '../../../routes/team/[team]/settings/+layout.svelte';

vi.mock('$app/state', () => ({
	page: {
		route: { id: '/team/[team]/settings' },
		params: { team: 'my-team' },
		url: new URL('https://console.example.com/team/my-team/settings')
	}
}));
vi.mock('$app/paths', () => ({
	resolve: (route: string, params: { team: string }) => route.replace('[team]', params.team)
}));

let component: ReturnType<typeof mount> | undefined;

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
});

it.each([
	[false, false, false, false],
	[true, false, false, true],
	[false, true, false, true],
	[false, false, true, true]
])(
	'shows webhook navigation for member=%s owner=%s admin=%s: %s',
	(viewerIsMember, viewerIsOwner, isAdmin, visible) => {
		component = mount(SettingsLayout, {
			target: document.body,
			props: {
				params: { team: 'my-team' },
				data: { viewerIsMember, viewerIsOwner, isAdmin } as ComponentProps<
					typeof SettingsLayout
				>['data'],
				children: createRawSnippet(() => ({ render: () => '<div>Settings content</div>' }))
			}
		});
		flushSync();
		expect(document.querySelector('a[href="/team/my-team/settings/webhooks"]') !== null).toBe(
			visible
		);
		expect(document.body.textContent).toContain('Settings content');
	}
);
