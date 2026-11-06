import type { TeamWebhookActivityStore, TeamWebhooksActivityStore } from '$houdini';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import { get, readable, writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebhookActivityCard from './WebhookActivityCard.svelte';

vi.mock('$houdini', () => ({
	graphql: () => ({}),
	fragment: () =>
		readable({
			__typename: 'WebhookCreatedActivityLogEntry',
			id: 'activity-id',
			actor: 'user@example.com',
			createdAt: new Date('2026-11-06T07:00:00Z'),
			environmentName: null,
			message: 'Webhook created',
			resourceName: 'webhook-id',
			webhook: { name: 'Deployment notifications' },
			resourceType: 'WEBHOOK',
			teamSlug: 'my-team'
		})
}));
vi.mock('$app/state', () => ({
	page: { url: new URL('https://console.example.com/team/my-team/activity-log') }
}));

type ActivityState = Parameters<Parameters<TeamWebhookActivityStore['subscribe']>[0]>[0];

function initialState(empty = false): ActivityState {
	const pageInfo = {
		hasNextPage: !empty,
		hasPreviousPage: false,
		startCursor: 'activity-cursor',
		endCursor: 'activity-cursor'
	};
	return {
		data: {
			node: {
				__typename: 'WebhookSubscription',
				activityLog: {
					pageInfo,
					edges: empty
						? []
						: [
								{
									cursor: 'activity-cursor',
									node: { ' $fragments': { ActivityLogEntryFragment: {} } }
								}
							]
				}
			}
		},
		pageInfo,
		errors: null,
		fetching: false,
		partial: false,
		stale: false,
		source: null,
		variables: { id: 'webhook-id' }
	};
}

const state = writable(initialState());
const loadNextPage = vi.fn<TeamWebhookActivityStore['loadNextPage']>();
let cleanup: (() => Promise<void>) | undefined;

function renderCard(
	activityStore: ComponentProps<typeof WebhookActivityCard>['activityStore'] = {
		subscribe: state.subscribe,
		loadNextPage
	}
) {
	const component = mount(WebhookActivityCard, {
		target: document.body,
		props: { activityStore }
	});
	cleanup = () => unmount(component);
	flushSync();
}

function loadMoreButton() {
	const button = [...document.querySelectorAll('button')].find(
		(button) => button.textContent?.trim() === 'Load more'
	);
	if (!button) throw new Error('Missing activity Load more button');
	return button;
}

beforeEach(() => {
	state.set(initialState());
	loadNextPage.mockReset().mockResolvedValue(get(state));
});

afterEach(async () => {
	await cleanup?.();
	cleanup = undefined;
	document.body.replaceChildren();
	vi.restoreAllMocks();
});

describe('Webhook activity card', () => {
	it.each([false, true])('supports team-wide activity, empty=%s', async (empty) => {
		const initial = initialState(empty);
		const node = initial.data?.node;
		if (node?.__typename !== 'WebhookSubscription') {
			throw new Error('Missing webhook activity fixture');
		}
		const teamState = writable<
			Parameters<Parameters<TeamWebhooksActivityStore['subscribe']>[0]>[0]
		>({
			...initial,
			data: { team: { activityLog: node.activityLog } },
			variables: { team: 'my-team' }
		});
		const loadTeamPage = vi
			.fn<TeamWebhooksActivityStore['loadNextPage']>()
			.mockResolvedValue(get(teamState));
		renderCard({ subscribe: teamState.subscribe, loadNextPage: loadTeamPage });
		if (empty) {
			expect(document.body.textContent).toContain('No activity log entries found.');
		} else {
			expect(document.body.textContent).toContain('Deployment notifications');
			loadMoreButton().click();
			await tick();
			expect(loadTeamPage).toHaveBeenCalledTimes(1);
		}
		expect(loadNextPage).not.toHaveBeenCalled();
	});

	it('shows initial activity without fetching again', () => {
		renderCard();
		expect(document.body.textContent).toContain('Deployment notifications');
		expect(document.body.textContent).toContain('created');
		expect(loadNextPage).not.toHaveBeenCalled();
	});

	it('disables pagination and prevents duplicate requests while a page is loading', async () => {
		const pending =
			Promise.withResolvers<Awaited<ReturnType<TeamWebhookActivityStore['loadNextPage']>>>();
		loadNextPage.mockReturnValue(pending.promise);
		renderCard();
		const button = loadMoreButton();
		button.click();
		button.click();
		flushSync();
		expect(button.disabled).toBe(true);
		expect(button.textContent).toContain('Loading');
		expect(loadNextPage).toHaveBeenCalledTimes(1);
		pending.resolve(get(state));
		await tick();
		expect(button.disabled).toBe(false);
	});

	it('displays pagination GraphQL errors even when the parent store has none', async () => {
		loadNextPage.mockResolvedValue({
			...get(state),
			errors: [{ message: 'Activity page could not be loaded.' }]
		});
		renderCard();
		loadMoreButton().click();
		await tick();
		expect(get(state).errors).toBeNull();
		expect(document.body.textContent).toContain('Activity page could not be loaded.');
		expect(document.body.textContent).toContain('Deployment notifications');
		expect(loadMoreButton().disabled).toBe(false);
	});

	it('reports thrown failures and allows retrying', async () => {
		const error = new Error('Connection interrupted');
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		loadNextPage.mockRejectedValue(error);
		renderCard();
		loadMoreButton().click();
		await tick();
		expect(log).toHaveBeenCalledWith('Unable to load more webhook activity:', error);
		expect(document.body.textContent).toContain('Unable to load more activity. Try again.');
		expect(loadMoreButton().disabled).toBe(false);
	});

	it('clears pagination errors after a successful retry', async () => {
		loadNextPage
			.mockResolvedValueOnce({ ...get(state), errors: [{ message: 'Temporary activity error' }] })
			.mockResolvedValueOnce(get(state));
		renderCard();
		loadMoreButton().click();
		await tick();
		expect(document.body.textContent).toContain('Temporary activity error');
		loadMoreButton().click();
		await tick();
		expect(document.body.textContent).not.toContain('Temporary activity error');
		expect(loadNextPage).toHaveBeenCalledTimes(2);
	});

	it('shows the shared empty state only for a successfully loaded empty log', () => {
		state.set(initialState(true));
		renderCard();
		expect(document.body.textContent).toContain('No activity log entries found.');
		expect(
			[...document.querySelectorAll('button')].some(
				(button) => button.textContent?.trim() === 'Load more'
			)
		).toBe(false);
	});

	it('shows initial query errors without an empty-state fallback', () => {
		state.set({ ...initialState(), data: null, errors: [{ message: 'Activity unavailable' }] });
		renderCard();
		expect(document.body.textContent).toContain('Activity unavailable');
		expect(document.body.textContent).not.toContain('No activity log entries found.');
	});

	it('does not render cached activity alongside a query authorization error without a code', () => {
		state.set({ ...initialState(), errors: [{ message: 'Access denied.' }] });
		renderCard();
		expect(document.body.textContent).toContain('Access denied.');
		expect(document.body.textContent).not.toContain('Deployment notifications');
		expect(document.body.textContent).not.toContain('No activity log entries found.');
		expect(document.querySelector('button')).toBeNull();
	});
});
