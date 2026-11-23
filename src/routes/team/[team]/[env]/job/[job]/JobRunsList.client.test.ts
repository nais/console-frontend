import { JobRunsListStore, TriggerJobFromActionsStore } from '$houdini';
import { buildSchema, graphql, GraphQLSchema } from 'graphql';
import { readFileSync } from 'node:fs';
import { get } from 'svelte/store';
import { onTestFinished, vi } from 'vitest';

vi.mock('$app/env', () => ({ browser: true, dev: false }));
vi.mock('$app/environment', () => ({ browser: true, building: false }));

const apiSchema = buildSchema(readFileSync('schema.graphql', 'utf8'), { assumeValid: true });
const schema = new GraphQLSchema({
	...apiSchema.toConfig(),
	directives: apiSchema
		.getDirectives()
		.filter((directive) => !['defer', 'stream'].includes(directive.name)),
	assumeValid: true
});

test.each([0, 1, 25])(
	'keeps unique run IDs after trigger and polling with %i existing runs',
	async (existing) => {
		const prefix = `job-runs-${existing}`;
		const run = (name: string) => ({
			id: `${prefix}-${name}`,
			name,
			startTime: null,
			completionTime: null,
			duration: 0,
			instances: { pageInfo: { totalCount: 0 } },
			status: { message: 'Pending', state: 'PENDING' },
			trigger: { type: 'MANUAL', actor: 'user' }
		});
		let runs = Array.from({ length: existing }, (_, index) => run(`old-${index}`));
		const network = vi.fn<typeof fetch>(async (_input, init) => {
			const { query, variables } = JSON.parse(String(init?.body));
			const result = await graphql({
				schema,
				source: query,
				variableValues: variables,
				rootValue: {
					team: {
						id: `${prefix}-team`,
						environment: {
							id: `${prefix}-env`,
							job: {
								id: prefix,
								runs: ({ first, after }: { first: number; after: string | null }) => {
									const start = Number(after ?? 0);
									const end = Math.min(start + first, runs.length);
									return {
										edges: runs.slice(start, end).map((node, index) => ({
											node,
											cursor: String(start + index + 1)
										})),
										pageInfo: {
											totalCount: runs.length,
											hasNextPage: end < runs.length,
											hasPreviousPage: start > 0,
											startCursor: String(start),
											endCursor: String(end)
										}
									};
								}
							}
						}
					},
					triggerJob: () => {
						const node = run('new');
						runs = [node, ...runs];
						return { job: { id: prefix }, jobRun: node };
					}
				}
			});
			expect(result.errors).toBeUndefined();
			return Response.json(result);
		});
		vi.stubGlobal('fetch', network);
		onTestFinished(() => {
			vi.unstubAllGlobals();
		});
		const store = new JobRunsListStore();
		await store.fetch({
			fetch: network,
			policy: 'NetworkOnly',
			variables: { team: prefix, env: 'dev', job: prefix }
		});
		onTestFinished(store.subscribe(() => {}));
		const snapshots: string[][] = [];
		onTestFinished(
			store.subscribe((value) => {
				snapshots.push(
					value.data?.team?.environment?.job?.runs.edges.map(({ node }) => node.id) ?? []
				);
			})
		);
		await new TriggerJobFromActionsStore().mutate(
			{ teamSlug: prefix, environment: 'dev', jobName: prefix, runName: 'new' },
			{ fetch: network }
		);
		await vi.waitFor(() => {
			expect(
				get(store).data?.team?.environment?.job?.runs.edges.map(({ node }) => node.id)
			).toEqual(runs.slice(0, 20).map((node) => node.id));
			expect(get(store).data?.team?.environment?.job?.runs.pageInfo.totalCount).toBe(runs.length);
		});
		await store.fetch({ fetch: network, policy: 'NetworkOnly' });
		await store.fetch({ fetch: network, policy: 'NetworkOnly' });
		if (get(store).data?.team?.environment?.job?.runs.pageInfo.hasNextPage) {
			await store.loadNextPage({ fetch: network });
		}
		expect(get(store).data?.team?.environment?.job?.runs.edges.map(({ node }) => node.id)).toEqual(
			runs.map((node) => node.id)
		);
		for (const ids of snapshots) {
			expect(ids).toEqual([...new Set(ids)]);
		}
	}
);
