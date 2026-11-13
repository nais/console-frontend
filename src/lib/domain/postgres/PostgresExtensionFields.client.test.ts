import { flushSync, mount, unmount } from 'svelte';
import PostgresExtensionFields from './PostgresExtensionFields.svelte';

let component: ReturnType<typeof PostgresExtensionFields> | undefined;

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
});

test('retains extension toggles when the incoming empty selection is a prop getter', () => {
	const form = document.createElement('form');
	document.body.append(form);
	component = mount(PostgresExtensionFields, {
		target: form,
		props: {
			available: ['pgcrypto', 'vector'],
			get selected() {
				return [];
			}
		}
	});
	flushSync();

	function toggle(value: string) {
		const checkbox = form.querySelector<HTMLInputElement>(
			`input[name="extensions"][value="${value}"]`
		);
		if (!checkbox) throw new Error(`Missing extension checkbox: ${value}`);
		checkbox.click();
		flushSync();
	}

	toggle('vector');
	expect(form.textContent).toContain('1 selected: vector');
	toggle('pgcrypto');
	expect(form.textContent).toContain('2 selected: vector, pgcrypto');
	expect(new FormData(form).getAll('extensions')).toEqual(['pgcrypto', 'vector']);

	toggle('vector');
	toggle('pgcrypto');
	expect(form.textContent).toContain('None selected');
	expect(new FormData(form).getAll('extensions')).toEqual([]);
	expect(new FormData(form).get('extensionsPresent')).toBe('true');
});
