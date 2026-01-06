import {
	graphql,
	ValkeyMaxMemoryPolicy,
	type ValkeyMaxMemoryPolicy$options,
	ValkeyMemory,
	type ValkeyMemory$options,
	ValkeyTier,
	type ValkeyTier$options
} from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation UpdateValkey($input: UpdateValkeyInput!) {
		updateValkey(input: $input) {
			valkey {
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const tier = data.get('tier') as ValkeyTier$options | null;
		const memory = data.get('memory') as ValkeyMemory$options | null;
		const max_memory_policy = data.get('max_memory_policy') as ValkeyMaxMemoryPolicy$options | null;
		const notify_keyspace_events = data.get('notify_keyspace_events') as string | null;

		if (!tier || !memory) {
			return fail(400, {
				success: false,
				error: 'Missing required fields',
				tier,
				memory,
				max_memory_policy,
				notify_keyspace_events
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					name: params.valkey,
					environmentName: params.env,
					teamSlug: params.team,
					tier: ValkeyTier[tier as keyof typeof ValkeyTier],
					memory: ValkeyMemory[memory as keyof typeof ValkeyMemory],
					maxMemoryPolicy: !max_memory_policy
						? null
						: ValkeyMaxMemoryPolicy[max_memory_policy as keyof typeof ValkeyMaxMemoryPolicy],
					notifyKeyspaceEvents: notify_keyspace_events // empty strings are always passed along to clear any previously set value
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: res.errors![0].message,
				tier,
				memory,
				max_memory_policy,
				notify_keyspace_events
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to update Valkey',
				tier,
				memory,
				max_memory_policy,
				notify_keyspace_events
			});
		}

		return redirect(303, `/team/${params.team}/${params.env}/valkey/${params.valkey}`);
	}
};
