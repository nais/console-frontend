import { ReadMore } from '@nais/ui';
import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { fromStore, writable } from 'svelte/store';

let component: ReturnType<typeof ReadMore> | undefined;

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
});

it.each([true, false])(
	'keeps the user choice when defaultOpen changes after mounting with %s',
	(initial) => {
		const defaultOpen = writable(initial);
		const state = fromStore(defaultOpen);
		component = mount(ReadMore, {
			target: document.body,
			props: {
				header: 'Details',
				get defaultOpen() {
					return state.current;
				},
				children: createRawSnippet(() => ({ render: () => '<p>Operation details</p>' }))
			}
		});
		flushSync();
		const trigger = document.body.querySelector('button');
		if (!trigger) throw new Error('Missing disclosure trigger');
		expect(trigger.getAttribute('aria-expanded')).toBe(String(initial));

		flushSync(() => trigger.click());
		expect(trigger.getAttribute('aria-expanded')).toBe(String(!initial));
		flushSync(() => defaultOpen.set(!initial));
		flushSync(() => defaultOpen.set(initial));
		expect(trigger.getAttribute('aria-expanded')).toBe(String(!initial));
	}
);
