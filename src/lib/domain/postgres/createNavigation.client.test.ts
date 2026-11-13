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
