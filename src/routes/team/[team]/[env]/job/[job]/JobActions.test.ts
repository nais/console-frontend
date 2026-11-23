import triggerJob from '$houdini/artifacts/TriggerJobFromActions';
import { buildSchema, graphql, GraphQLSchema, parse, validate } from 'graphql';
import { readFileSync } from 'node:fs';

const apiSchema = buildSchema(
	readFileSync(new URL('../../../../../../../schema.graphql', import.meta.url), 'utf8'),
	{ assumeValid: true }
);
const schema = new GraphQLSchema({
	...apiSchema.toConfig(),
	directives: apiSchema
		.getDirectives()
		.filter((directive) => !['defer', 'stream'].includes(directive.name)),
	assumeValid: true
});

describe('TriggerJobFromActions', () => {
	test('generates a valid mutation including the run insertion fragment', () => {
		expect(validate(schema, parse(triggerJob.raw))).toEqual([]);
	});

	test.each([0, 3])('returns the instance count %i when triggering a run', async (totalCount) => {
		const instances = vi.fn(() => ({ pageInfo: { totalCount } }));
		const trigger = vi.fn(() => ({
			jobRun: {
				id: 'run-id',
				name: 'job-run',
				startTime: null,
				completionTime: null,
				duration: 0,
				instances,
				status: { message: 'Pending', state: 'PENDING' },
				trigger: { type: 'MANUAL', actor: 'user' }
			}
		}));
		const result = await graphql({
			schema,
			source: triggerJob.raw,
			rootValue: { triggerJob: trigger },
			variableValues: {
				teamSlug: 'team',
				environment: 'dev',
				jobName: 'job',
				runName: 'job-run'
			}
		});

		expect(result.errors).toBeUndefined();
		expect(trigger).toHaveBeenCalledOnce();
		expect(instances).toHaveBeenCalledOnce();
		expect(result.data).toMatchObject({
			triggerJob: {
				jobRun: { id: 'run-id', instances: { pageInfo: { totalCount } } }
			}
		});
	});
});
