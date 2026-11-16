import type { ComponentProps } from 'svelte';
import { flushSync, mount, unmount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { readable } from 'svelte/store';
import CreatePage from '../../../routes/team/[team]/postgres/create/+page.svelte';

const { goto, enhanced, page } = vi.hoisted(() => ({
	goto: vi.fn(),
	enhanced: { submit: undefined as ((input: { cancel: () => void }) => unknown) | undefined },
	page: {
		url: new URL(
			'https://console.test/team/test/postgres/create?mode=recovery&environment=dev&source=original'
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
		'https://console.test/team/test/postgres/create?mode=recovery&environment=dev&source=original'
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
	['mode', 'empty', 'recovery'],
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
		edit('targetTime', '2021-01-02T13:00');
		goto.mockRejectedValueOnce(new Error('offline'));
		edit(field, attempted);
		await vi.waitFor(() => {
			flushSync();
			expect(document.body.textContent).toContain('Could not load recovery options');
		});
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
		const cancel = vi.fn();
		expect(enhanced.submit!({ cancel })).toBeUndefined();
		expect(cancel).toHaveBeenCalledOnce();
		expect(document.querySelector<HTMLSelectElement>(`select[name="${field}"]`)!.value).toBe(
			original
		);
		let finishNavigation: () => void = () => {};
		goto.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finishNavigation = resolve;
				})
		);
		// Retry using another valid recovery context; errors must remain during the retry.
		edit('sourcePostgres', 'other');
		expect(document.body.textContent).toContain('Could not load recovery options');
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
			expect(document.body.textContent).not.toContain('Could not load recovery options');
		});
		expect(document.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(
			false
		);
		const submitted = new FormData(document.querySelector('form')!);
		expect(submitted.get('mode')).toBe('recovery');
		expect(submitted.get('sourcePostgres')).toBe('other');
		expect(submitted.get('name')).toBe('recovery-draft');
		expect(submitted.get('targetTime')).toBe('2021-01-02T13:00');
	}
);

test.each(['pagination', 'source'])(
	'preserves the entered name and UTC target through %s navigation after a validation failure, without submitting',
	async (navigation) => {
		const data = initialData();
		const state = new SvelteMap<string, unknown>([
			['data', data],
			[
				'form',
				{
					mode: 'recovery',
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
