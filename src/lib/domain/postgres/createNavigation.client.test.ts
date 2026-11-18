import type { ComponentProps } from 'svelte';
import { flushSync, mount, unmount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { readable } from 'svelte/store';
import { parseLocalDateTime } from './recovery.js';
import CreatePage from '../../../routes/team/[team]/postgres/create/+page.svelte';

const { goto, enhanced, page } = vi.hoisted(() => ({
	goto: vi.fn(),
	enhanced: { submit: undefined as ((input: { cancel: () => void }) => unknown) | undefined },
	page: {
		url: new URL(
			'https://console.test/team/test/postgres/create?mode=clone&environment=dev&source=original'
		)
	}
}));
vi.mock('$app/navigation', () => ({ goto }));
vi.mock('$app/state', () => ({ page }));
vi.mock('$app/forms', () => ({
	enhance: (_form: HTMLFormElement, submit: typeof enhanced.submit) => {
		enhanced.submit = submit;
		return { destroy() {} };
	}
}));

let component: ReturnType<typeof CreatePage> | undefined;
beforeEach(() => {
	page.url = new URL(
		'https://console.test/team/test/postgres/create?mode=clone&environment=dev&source=original'
	);
});
afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
	vi.resetAllMocks();
});

function initialData() {
	return {
		teamSlug: 'test',
		selectedEnvironment: 'dev',
		recoveryMode: true,
		CreatePostgresEnvironments: readable({
			data: { team: { environments: [{ environment: { name: 'dev' }, gcpProjectID: 'project' }] } },
			errors: null
		}),
		postgresOptions: [],
		recoverySource: {
			data: {
				team: {
					environment: {
						postgres: {
							id: 'original',
							name: 'original',
							majorVersion: '17',
							extensions: ['vector'],
							earliestRestoreTime: new Date('2020-01-01T00:00:00Z')
						}
					}
				}
			}
		},
		recoverySources: {
			data: {
				team: {
					postgreses: {
						nodes: [
							{ id: 'original', name: 'original' },
							{ id: 'other', name: 'other' }
						],
						pageInfo: { hasNextPage: true, endCursor: 'next-page' }
					}
				}
			}
		}
	} as unknown as ComponentProps<typeof CreatePage>['data'];
}

function mountWithState(
	data = initialData(),
	form: ComponentProps<typeof CreatePage>['form'] = null
) {
	const state = new SvelteMap<string, unknown>([
		['data', data],
		['form', form]
	]);
	component = mount(CreatePage, {
		target: document.body,
		props: {
			get data() {
				return state.get('data') as ComponentProps<typeof CreatePage>['data'];
			},
			get form() {
				return state.get('form') as ComponentProps<typeof CreatePage>['form'];
			},
			params: { team: 'test' }
		}
	});
	flushSync();
	return state;
}

function edit(name: string, value: string) {
	const input = document.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;
	input.value = value;
	input.dispatchEvent(
		new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })
	);
	flushSync();
}

function timeToggle() {
	return [...document.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')].find(
		(element) => element.textContent?.includes('Specify time')
	)!;
}
function toggleTime() {
	timeToggle().click();
	flushSync();
}

function tab(label: string) {
	return [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((element) =>
		element.textContent?.includes(label)
	)!;
}
function clickTab(label: string) {
	tab(label).click();
	flushSync();
}

test.each([true, false])(
	'preserves the live resource draft and customization open=%s after action failure and environment navigation clears the form',
	async (open) => {
		page.url = new URL('https://console.test/team/test/postgres/create?environment=dev');
		const data = {
			...initialData(),
			recoveryMode: false,
			CreatePostgresEnvironments: readable({
				data: {
					team: {
						environments: ['dev', 'prod'].map((name) => ({
							environment: { name },
							gcpProjectID: 'project'
						}))
					}
				},
				errors: null
			}),
			postgresOptions: ['dev', 'prod'].map((environment) => ({
				environment,
				options: {
					postgresMajorVersions: { values: ['17'], defaultValues: ['17'] },
					postgresExtensions: { values: ['vector'], defaultValues: [] }
				}
			}))
		} as unknown as ComponentProps<typeof CreatePage>['data'];
		const state = mountWithState(data);
		const form = document.querySelector('form')!;
		const customize = [...form.querySelectorAll('button')].find((button) =>
			button.textContent?.includes('Customize resources')
		)!;
		customize.click();
		flushSync();
		edit('name', 'draft-name');
		edit('cpu', '2');
		edit('memory', '4');
		edit('diskSize', '20');
		form.querySelector<HTMLInputElement>('input[name="highAvailability"]')!.click();
		flushSync();
		const complete = enhanced.submit!({ cancel: vi.fn() }) as (input: {
			result: unknown;
			update: () => Promise<void>;
		}) => Promise<void>;
		const rejected = {
			...Object.fromEntries(new FormData(form)),
			mode: 'empty',
			highAvailability: true,
			labelRows: [],
			errors: {},
			error: 'Name already exists.'
		};
		await complete({
			result: { type: 'failure', data: rejected },
			update: async () => {
				state.set('form', rejected);
			}
		});
		flushSync();
		// Changes made AFTER the action response must be retained, not merely its snapshot.
		edit('cpu', '3');
		edit('memory', '6');
		edit('diskSize', '30');
		edit('label_key', 'owner');
		edit('label_value', 'draft-owner');
		if (!open) {
			customize.click();
			flushSync();
		}
		let finishNavigation: () => void = () => {};
		goto.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finishNavigation = resolve;
				})
		);
		edit('environment', 'prod');
		expect(goto.mock.calls[0][0].searchParams.get('environment')).toBe('prod');
		page.url = goto.mock.calls[0][0];
		flushSync(() => {
			state.set('data', { ...data, selectedEnvironment: 'prod' });
			state.set('form', null);
		});
		finishNavigation();
		await vi.waitFor(() => {
			flushSync();
			expect(form.querySelector('select[name="environment"]')?.getAttribute('disabled')).toBeNull();
		});
		const submitted = new FormData(form);
		expect(submitted.get('cpu')).toBe('3');
		expect(submitted.get('memory')).toBe('6');
		expect(submitted.get('diskSize')).toBe('30');
		expect(submitted.has('highAvailability')).toBe(true);
		expect(submitted.get('name')).toBe('draft-name');
		expect(submitted.get('label_key')).toBe('owner');
		expect(submitted.get('label_value')).toBe('draft-owner');
		expect(customize.getAttribute('aria-expanded')).toBe(String(open));
	}
);

test.each([
	['mode', 'empty', 'clone'],
	['environment', 'prod', 'dev'],
	['sourcePostgres', 'other', 'original']
])(
	'blocks submission after rejected %s navigation until a context loads successfully',
	async (field, attempted, original) => {
		const data = initialData();
		data.CreatePostgresEnvironments = readable({
			data: {
				team: {
					environments: ['dev', 'prod'].map((name) => ({
						environment: { name },
						gcpProjectID: 'project'
					}))
				}
			},
			errors: null
		}) as typeof data.CreatePostgresEnvironments;
		const state = mountWithState(data);
		edit('name', 'recovery-draft');
		toggleTime();
		edit('targetTime', '2021-01-02T13:00');
		goto.mockRejectedValueOnce(new Error('offline'));
		if (field === 'mode') clickTab('Empty database');
		else edit(field, attempted);
		await vi.waitFor(() => {
			flushSync();
			expect(document.body.textContent).toContain('Could not load clone options');
		});
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
		const cancel = vi.fn();
		expect(enhanced.submit!({ cancel })).toBeUndefined();
		expect(cancel).toHaveBeenCalledOnce();
		if (field === 'mode') {
			expect(
				tab(original === 'clone' ? 'Clone existing database' : 'Empty database')
			).toHaveProperty('ariaSelected', 'true');
		} else {
			expect(document.querySelector<HTMLSelectElement>(`select[name="${field}"]`)!.value).toBe(
				original
			);
		}
		let finishNavigation: () => void = () => {};
		goto.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finishNavigation = resolve;
				})
		);
		// Retry using another valid recovery context; errors must remain during the retry.
		edit('sourcePostgres', 'other');
		expect(document.body.textContent).toContain('Could not load clone options');
		page.url = goto.mock.calls[1][0];
		const nextSource = data.recoverySource!;
		flushSync(() => {
			state.set('data', {
				...data,
				recoverySource: {
					...nextSource,
					data: {
						team: {
							environment: {
								postgres: { ...nextSource.data!.team.environment.postgres, name: 'other' }
							}
						}
					}
				}
			});
			state.set('form', null);
		});
		finishNavigation();
		await vi.waitFor(() => {
			flushSync();
			expect(document.body.textContent).not.toContain('Could not load clone options');
		});
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(
			false
		);
		const submitted = new FormData(document.querySelector('form')!);
		expect(submitted.get('mode')).toBe('clone');
		const local = parseLocalDateTime(
			'2021-01-02T13:00',
			Intl.DateTimeFormat().resolvedOptions().timeZone
		);
		expect(submitted.get('targetInstant')).toBe(
			'instant' in local ? local.instant.toISOString() : ''
		);
		expect(submitted.get('sourcePostgres')).toBe('other');
		expect(submitted.get('name')).toBe('recovery-draft');
		expect(submitted.get('targetTime')).toBe('2021-01-02T13:00');
	}
);

test.each(['pagination', 'source'])(
	'preserves the entered name and local target through %s navigation after a validation failure, without submitting',
	async (navigation) => {
		const data = initialData();
		const state = new SvelteMap<string, unknown>([
			['data', data],
			[
				'form',
				{
					mode: 'clone',
					name: 'rejected-name',
					environment: 'dev',
					majorVersion: '17',
					sourcePostgres: 'original',
					targetTime: '2021-01-01T12:00',
					extensions: undefined,
					labelRows: [],
					cpu: '',
					memory: '',
					diskSize: '',
					highAvailability: false,
					errors: {},
					error: 'Name already exists.'
				}
			]
		]);
		let finishNavigation: () => void = () => {};
		goto.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finishNavigation = resolve;
				})
		);
		component = mount(CreatePage, {
			target: document.body,
			props: {
				get data() {
					return state.get('data') as ComponentProps<typeof CreatePage>['data'];
				},
				get form() {
					return state.get('form') as ComponentProps<typeof CreatePage>['form'];
				},
				params: { team: 'test' }
			}
		});
		flushSync();
		const form = document.querySelector('form')!;
		const submit = vi.fn();
		form.addEventListener('submit', submit);
		const name = form.querySelector<HTMLInputElement>('input[name="name"]')!;
		name.value = 'new-distinct-name';
		name.dispatchEvent(new Event('input', { bubbles: true }));
		const target = form.querySelector<HTMLInputElement>('input[name="targetTime"]')!;
		target.value = '2021-01-02T13:00';
		target.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		if (navigation === 'pagination') {
			const more = [...form.querySelectorAll('button')].find((button) =>
				button.textContent?.includes('More sources')
			)!;
			more.click();
		} else {
			const source = form.querySelector<HTMLSelectElement>('select[name="sourcePostgres"]')!;
			source.value = 'other';
			source.dispatchEvent(new Event('change', { bubbles: true }));
		}
		flushSync();
		expect(goto).toHaveBeenCalledTimes(1);
		expect(submit).not.toHaveBeenCalled();
		const cancel = vi.fn();
		enhanced.submit?.({ cancel });
		expect(cancel).toHaveBeenCalledOnce();
		const nextData = structuredClone({
			recoverySource: data.recoverySource,
			recoverySources: data.recoverySources
		});
		if (navigation === 'source') {
			const snapshot = nextData.recoverySource!;
			const team = snapshot.data!.team;
			nextData.recoverySource = {
				...snapshot,
				data: {
					...snapshot.data!,
					team: {
						...team,
						environment: {
							...team.environment,
							postgres: { ...team.environment.postgres, name: 'other' }
						}
					}
				}
			};
		}
		flushSync(() => {
			state.set('data', { ...data, ...nextData });
			state.set('form', null); // SvelteKit clears the previous action result during goto.
		});
		finishNavigation();
		await vi.waitFor(() => {
			flushSync();
			expect(form.querySelector('input[name="targetTime"]')).not.toBeNull();
		});
		expect(form.querySelector<HTMLInputElement>('input[name="name"]')?.value).toBe(
			'new-distinct-name'
		);
		expect(form.querySelector<HTMLInputElement>('input[name="targetTime"]')?.value).toBe(
			'2021-01-02T13:00'
		);
		expect(submit).not.toHaveBeenCalled();
	}
);

test.each(['transport', 'action'])(
	'blocks resubmission when the %s result cannot confirm creation',
	async (outcome) => {
		component = mount(CreatePage, {
			target: document.body,
			props: { data: initialData(), form: null, params: { team: 'test' } }
		});
		flushSync();
		const cancel = vi.fn();
		const complete = enhanced.submit!({ cancel }) as (input: {
			result: unknown;
			update: () => Promise<void>;
		}) => Promise<void>;
		const update = vi.fn().mockResolvedValue(undefined);
		await complete({
			result:
				outcome === 'transport'
					? { type: 'error' }
					: { type: 'failure', data: { outcomeUnknown: true } },
			update
		});
		flushSync();
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
		expect(document.body.textContent).toContain('Review team databases');
		if (outcome === 'transport') expect(update).not.toHaveBeenCalled();
		enhanced.submit!({ cancel });
		expect(cancel).toHaveBeenCalledOnce();
	}
);

describe('clone tabs and local time', () => {
	test('opens on the clone tab for the legacy recovery deep link and keeps the selected source', () => {
		page.url = new URL(
			'https://console.test/team/test/postgres/create?mode=recovery&environment=dev&source=original'
		);
		mountWithState();
		expect(tab('Clone existing database').getAttribute('aria-selected')).toBe('true');
		expect(tab('Empty database').getAttribute('aria-selected')).toBe('false');
		expect(document.querySelector<HTMLSelectElement>('select[name="sourcePostgres"]')!.value).toBe(
			'original'
		);
		expect(document.body.textContent).not.toContain('Restore');
	});
	test('switching tabs navigates with the mode as query state and clears the source', () => {
		goto.mockReturnValue(new Promise(() => {}));
		mountWithState();
		clickTab('Empty database');
		const url = goto.mock.calls[0][0] as URL;
		expect(url.searchParams.get('mode')).toBe('empty');
		expect(url.searchParams.has('source')).toBe(false);
	});
	test('tabs are keyboard operable buttons in a tablist with only the active tab tabbable', () => {
		mountWithState();
		expect(document.querySelector('[role="tablist"]')).not.toBeNull();
		expect(tab('Clone existing database').tabIndex).toBe(0);
		expect(tab('Empty database').tabIndex).toBe(-1);
		expect(tab('Empty database').tagName).toBe('BUTTON');
	});
	test('keeps the time disclosure collapsed by default and submits no target time', () => {
		mountWithState();
		expect(timeToggle().getAttribute('aria-expanded')).toBe('false');
		expect(document.querySelector('input[name="targetTime"]')).toBeNull();
		expect(document.querySelector('input[name="targetInstant"]')).toBeNull();
		expect(document.body.textContent).not.toContain('Earliest clone time');
		expect(document.body.textContent).toContain('latest available point');
		const submitted = new FormData(document.querySelector('form')!);
		expect(submitted.has('targetTime')).toBe(false);
		expect(submitted.has('targetInstant')).toBe(false);
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(
			false
		);
	});
	test('sends the absolute instant for the typed time once expanded', () => {
		mountWithState();
		toggleTime();
		expect(timeToggle().getAttribute('aria-expanded')).toBe('true');
		const instant = () =>
			document.querySelector<HTMLInputElement>('input[name="targetInstant"]')!.value;
		expect(document.querySelector<HTMLInputElement>('input[name="targetTime"]')!.required).toBe(
			false
		);
		expect(document.body.textContent).toContain('Earliest clone time');
		expect(instant()).toBe('');
		edit('targetTime', '2021-01-02T13:00');
		const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const expected = parseLocalDateTime('2021-01-02T13:00', zone);
		expect(instant()).toBe('instant' in expected ? expected.instant.toISOString() : 'x');
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(
			false
		);
	});
	test('collapsing after typing discards the time so no stale value is submitted', () => {
		mountWithState();
		toggleTime();
		edit('targetTime', '2021-01-02T13:00');
		toggleTime();
		const submitted = new FormData(document.querySelector('form')!);
		expect(submitted.has('targetTime')).toBe(false);
		expect(submitted.has('targetInstant')).toBe(false);
		toggleTime();
		expect(document.querySelector<HTMLInputElement>('input[name="targetTime"]')!.value).toBe('');
		expect(document.querySelector<HTMLInputElement>('input[name="targetInstant"]')!.value).toBe('');
	});
	test('starts expanded with the draft when a time was entered before a failed submit', () => {
		mountWithState(initialData(), {
			mode: 'clone',
			name: 'x',
			environment: 'dev',
			majorVersion: '17',
			sourcePostgres: 'original',
			targetTime: '2021-01-01T12:00',
			extensions: undefined,
			labelRows: [],
			cpu: '',
			memory: '',
			diskSize: '',
			highAvailability: false,
			errors: {},
			error: 'Name already exists.'
		} as ComponentProps<typeof CreatePage>['form']);
		expect(timeToggle().getAttribute('aria-expanded')).toBe('true');
		expect(document.querySelector<HTMLInputElement>('input[name="targetTime"]')!.value).toBe(
			'2021-01-01T12:00'
		);
	});
	test('disables submit with a field error when the default is before the earliest time', () => {
		const data = initialData();
		const postgres = data.recoverySource!.data!.team.environment.postgres;
		const future = { ...postgres, earliestRestoreTime: new Date(Date.now() + 3_600_000) };
		data.recoverySource = {
			data: { team: { environment: { postgres: future } } }
		} as typeof data.recoverySource;
		mountWithState(data);
		// The error stays visible although the disclosure is collapsed.
		expect(timeToggle().getAttribute('aria-expanded')).toBe('false');
		expect(document.querySelector('[role="alert"]')?.textContent).toContain('earliest clone time');
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
	});
});

describe('clone configuration', () => {
	const options = {
		postgresMajorVersions: { values: ['17', '18'], defaultValues: ['18'] },
		postgresExtensions: { values: ['pgcrypto', 'vector'], defaultValues: [] }
	};
	function sourceData(
		overrides: Record<string, unknown> = {},
		name = 'original'
	): ComponentProps<typeof CreatePage>['data'] {
		const data = initialData();
		const postgres = {
			...data.recoverySource!.data!.team.environment.postgres,
			name,
			id: name,
			highAvailability: false,
			resources: { cpu: '500m', memory: '2Gi', diskSize: '20480Mi' },
			...overrides
		};
		return {
			...data,
			postgresOptions: [{ environment: 'dev', options, errors: null }],
			recoverySource: { data: { team: { environment: { postgres } } } }
		} as unknown as ComponentProps<typeof CreatePage>['data'];
	}
	const form = () => document.querySelector('form')!;
	const customize = () =>
		[...document.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')].find((button) =>
			button.textContent?.includes('Customize resources')
		)!;
	const field = (name: string) =>
		document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
	const checkbox = (value: string) =>
		document.querySelector<HTMLInputElement>(`input[type="checkbox"][value="${value}"]`)!;
	const submitted = () => new FormData(form());

	test('prefills the shared fields from the source with locked version and extensions', () => {
		mountWithState(sourceData({ highAvailability: true }));
		expect(field('cpu').value).toBe('0.5');
		expect(field('memory').value).toBe('2');
		expect(field('diskSize').value).toBe('20');
		expect(field('highAvailability').checked).toBe(true);
		// The version is plain text only: no control, and nothing posted for it.
		expect(document.querySelector('select[name="majorVersion"], select[disabled]')).toBeNull();
		expect(document.querySelector('input[name="majorVersion"]')).toBeNull();
		expect(submitted().has('majorVersion')).toBe(false);
		expect(document.body.textContent).toContain('(PostgreSQL 17)');
		expect(checkbox('vector').checked).toBe(true);
		expect(checkbox('vector').disabled).toBe(true);
		expect(checkbox('pgcrypto').checked).toBe(false);
		expect(checkbox('pgcrypto').disabled).toBe(false);
		expect(submitted().getAll('extensions')).toEqual(['vector']);
		expect(document.body.textContent).toContain("Starts from the source's configuration");
		expect(document.body.textContent).not.toContain('inherited from the source');
	});
	test('collapses Customize resources by default and keeps unchanged values posted', () => {
		mountWithState(sourceData());
		expect(customize().getAttribute('aria-expanded')).toBe('false');
		expect(document.body.textContent).toContain('Resources');
		expect(submitted().get('cpu')).toBe('0.5');
	});
	test('expands Customize resources for a differing draft or a validation error', () => {
		const draft = (fields: Record<string, unknown>, errors = {}) =>
			({
				mode: 'clone',
				name: 'x',
				environment: 'dev',
				majorVersion: '17',
				sourcePostgres: 'original',
				targetTime: '',
				extensions: ['vector'],
				labelRows: [],
				cpu: '0.5',
				memory: '2',
				diskSize: '20',
				highAvailability: false,
				errors,
				error: 'Failed.',
				...fields
			}) as ComponentProps<typeof CreatePage>['form'];
		mountWithState(sourceData(), draft({ cpu: '3' }));
		expect(customize().getAttribute('aria-expanded')).toBe('true');
		document.body.replaceChildren();
		mountWithState(sourceData(), draft({}, { diskSize: 'invalid' }));
		expect(customize().getAttribute('aria-expanded')).toBe('true');
		document.body.replaceChildren();
		mountWithState(sourceData(), draft({}));
		expect(customize().getAttribute('aria-expanded')).toBe('false');
	});
	test('leaves fields empty when the source has no configured resources', () => {
		mountWithState(sourceData({ resources: null }));
		for (const name of ['cpu', 'memory', 'diskSize']) expect(field(name).value).toBe('');
		expect(document.body.textContent).toContain('Not set on the source; blank inherits.');
	});
	test('adding an extension posts source plus added; the locked one cannot be removed', () => {
		mountWithState(sourceData());
		checkbox('vector').click();
		checkbox('pgcrypto').click();
		flushSync();
		expect(checkbox('vector').checked).toBe(true);
		expect(submitted().getAll('extensions').sort()).toEqual(['pgcrypto', 'vector']);
	});
	test('blocks submit when storage is below the source (20Gi), accepts equal or larger', () => {
		mountWithState(sourceData());
		const submit = () => {
			const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });
			form().dispatchEvent(event);
			flushSync();
			return event.defaultPrevented;
		};
		edit('diskSize', '19');
		expect(submit()).toBe(true);
		expect(document.body.textContent).toContain('between 20 and 1000');
		edit('diskSize', '20');
		expect(submit()).toBe(false);
		edit('diskSize', '21');
		expect(submit()).toBe(false);
	});
	test('changing the source resets the configuration to the new source', () => {
		const state = mountWithState(sourceData());
		edit('cpu', '4');
		edit('diskSize', '50');
		checkbox('pgcrypto').click();
		flushSync();
		page.url = new URL(
			'https://console.test/team/test/postgres/create?mode=clone&environment=dev&source=other'
		);
		state.set(
			'data',
			sourceData(
				{ resources: { cpu: '1', memory: '1Gi', diskSize: '8Gi' }, extensions: [] },
				'other'
			)
		);
		flushSync();
		expect(field('cpu').value).toBe('1');
		expect(field('diskSize').value).toBe('8');
		expect(checkbox('pgcrypto').checked).toBe(false);
		expect(submitted().getAll('extensions')).toEqual([]);
	});
	test('does not leak values between the empty and clone tabs', () => {
		const state = mountWithState(sourceData());
		edit('cpu', '4');
		edit('name', 'shared-name');
		page.url = new URL('https://console.test/team/test/postgres/create?mode=empty&environment=dev');
		state.set('data', { ...sourceData(), recoveryMode: false, recoverySource: null });
		flushSync();
		expect(tab('Empty database').getAttribute('aria-selected')).toBe('true');
		const empty = submitted();
		expect(empty.get('cpu') ?? '').toBe('');
		expect(empty.has('sourcePostgres')).toBe(false);
		expect(empty.has('targetTime')).toBe(false);
		expect(empty.getAll('extensions')).not.toContain('vector');
		expect(empty.get('name')).toBe('shared-name');
		page.url = new URL(
			'https://console.test/team/test/postgres/create?mode=clone&environment=dev&source=original'
		);
		state.set('data', sourceData());
		flushSync();
		expect(field('cpu').value).toBe('0.5');
	});
	test('keeps the edited configuration after a failed submit', () => {
		mountWithState(sourceData(), {
			mode: 'clone',
			name: 'x',
			environment: 'dev',
			majorVersion: '17',
			sourcePostgres: 'original',
			targetTime: '',
			extensions: ['vector', 'pgcrypto'],
			labelRows: [],
			cpu: '3',
			memory: '2',
			diskSize: '40',
			highAvailability: true,
			errors: {},
			error: 'Name already exists.'
		} as ComponentProps<typeof CreatePage>['form']);
		expect(field('cpu').value).toBe('3');
		expect(field('diskSize').value).toBe('40');
		expect(field('highAvailability').checked).toBe(true);
		expect(checkbox('pgcrypto').checked).toBe(true);
	});
});

describe('clone configuration drafts across navigation', () => {
	const sourceData = (name: string, cpu: string) => {
		const data = initialData();
		const postgres = {
			...data.recoverySource!.data!.team.environment.postgres,
			name,
			id: name,
			highAvailability: false,
			resources: { cpu, memory: '2Gi', diskSize: '20480Mi' }
		};
		return {
			...data,
			postgresOptions: [
				{
					environment: 'dev',
					options: {
						postgresMajorVersions: { values: ['17'], defaultValues: ['17'] },
						postgresExtensions: { values: ['vector'], defaultValues: [] }
					}
				}
			],
			recoverySource: { data: { team: { environment: { postgres } } } }
		} as unknown as ComponentProps<typeof CreatePage>['data'];
	};
	const cpu = () => document.querySelector<HTMLInputElement>('input[name="cpu"]')!;
	const more = () =>
		[...document.querySelectorAll('button')].find((b) => b.textContent?.includes('More sources'))!;

	test('keeps drafts through pagination and a failed navigation, inert while loading', async () => {
		const state = mountWithState(sourceData('original', '500m'));
		edit('cpu', '4');
		let fail: (error: Error) => void = () => {};
		goto.mockImplementation(
			() =>
				new Promise<void>((_, reject) => {
					fail = reject;
				})
		);
		const element = cpu();
		more().click();
		flushSync();
		expect(goto.mock.calls[0][0].searchParams.get('after')).toBe('next-page');
		// Still mounted, same element, draft intact, but inert.
		expect(cpu()).toBe(element);
		expect(cpu().value).toBe('4');
		expect(cpu().closest('fieldset')!.disabled).toBe(true);
		// Pagination data for the same source arrives.
		state.set('data', sourceData('original', '500m'));
		flushSync();
		expect(cpu()).toBe(element);
		fail(new Error('offline'));
		await vi.waitFor(() => {
			flushSync();
			expect(document.body.textContent).toContain('Could not load clone options');
		});
		expect(cpu()).toBe(element);
		expect(cpu().value).toBe('4');
		expect(cpu().closest('fieldset')!.disabled).toBe(false);
	});
	test('resets drafts only when the source changes', () => {
		const state = mountWithState(sourceData('original', '500m'));
		edit('cpu', '4');
		state.set('data', sourceData('original', '500m'));
		flushSync();
		expect(cpu().value).toBe('4');
		state.set('data', sourceData('other', '1'));
		flushSync();
		expect(cpu().value).toBe('1');
	});
	test('has no max on the target time (repeated hour) and relies on instant validation', () => {
		mountWithState(sourceData('original', '500m'));
		toggleTime();
		const input = document.querySelector<HTMLInputElement>('input[name="targetTime"]')!;
		expect(input.hasAttribute('max')).toBe(false);
	});
});

describe('clone configuration disclosure', () => {
	test('errors arriving after the user collapsed it reopen it; no errors leaves the choice', () => {
		const data = initialData();
		data.postgresOptions = [
			{
				environment: 'dev',
				options: {
					postgresMajorVersions: { values: ['17'], defaultValues: ['17'] },
					postgresExtensions: { values: ['vector'], defaultValues: [] }
				}
			}
		] as unknown as typeof data.postgresOptions;
		const state = mountWithState(data);
		const toggle = () =>
			[...document.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')].find((b) =>
				b.textContent?.includes('Customize resources')
			)!;
		toggle().click();
		flushSync();
		expect(toggle().getAttribute('aria-expanded')).toBe('true');
		toggle().click();
		flushSync();
		expect(toggle().getAttribute('aria-expanded')).toBe('false');
		state.set('form', {
			mode: 'clone',
			name: 'x',
			environment: 'dev',
			majorVersion: '17',
			sourcePostgres: 'original',
			targetTime: '',
			labelRows: [],
			cpu: '',
			memory: '',
			diskSize: '',
			highAvailability: false,
			errors: { cpu: 'invalid' },
			error: 'Failed.'
		});
		flushSync();
		expect(toggle().getAttribute('aria-expanded')).toBe('true');
	});
});
