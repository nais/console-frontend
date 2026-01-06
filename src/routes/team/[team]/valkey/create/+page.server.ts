import { graphql, ValkeyMaxMemoryPolicy, ValkeyMemory, ValkeyTier } from '$houdini';
import { formatGraphQLErrors } from '$lib/graphql-errors';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation CreateValkey($input: CreateValkeyInput!) {
		createValkey(input: $input) {
			valkey {
				name
				teamEnvironment {
					environment {
						name
					}
				}
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const name = data.get('name') as string | null;
		const environment = data.get('environment') as string | null;
		const tier = data.get('tier') as string | null;
		const memory = data.get('memory') as string | null;
		const max_memory_policy = data.get('max_memory_policy') as string | null;
		const notify_keyspace_events = data.get('notify_keyspace_events') as string | null;

		if (!name || !environment || !tier || !memory) {
			return fail(400, {
				success: false,
				error: 'Missing required fields',
				name,
				environment,
				tier,
				memory,
				max_memory_policy,
				notify_keyspace_events
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					name: name,
					environmentName: environment,
					teamSlug: params.team,
					tier: ValkeyTier[tier as keyof typeof ValkeyTier],
					memory: ValkeyMemory[memory as keyof typeof ValkeyMemory],
					maxMemoryPolicy: !max_memory_policy
						? null
						: ValkeyMaxMemoryPolicy[max_memory_policy as keyof typeof ValkeyMaxMemoryPolicy],
					notifyKeyspaceEvents: !notify_keyspace_events ? null : notify_keyspace_events
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: formatGraphQLErrors(res.errors),
				name,
				environment,
				tier,
				memory,
				max_memory_policy,
				notify_keyspace_events
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to create Valkey',
				name,
				environment,
				tier,
				memory,
				max_memory_policy,
				notify_keyspace_events
			});
		}

		return redirect(
			303,
			`/team/${params.team}/${res.data.createValkey.valkey.teamEnvironment.environment.name}/valkey/${res.data.createValkey.valkey.name}`
		);
	}
};
