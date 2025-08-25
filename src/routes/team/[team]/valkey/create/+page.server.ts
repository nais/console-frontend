import { graphql, ValkeyMaxMemoryPolicy, ValkeySize, ValkeyTier } from '$houdini';

const mutation = graphql(`
	mutation CreateValkey($input: CreateValkeyInput!) {
		createValkey(input: $input) {
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

		const name = data.get('name') as string | null;
		const environment = data.get('environment') as string | null;
		const tier = data.get('tier') as string | null;
		const size = data.get('size') as string | null;
		const max_memory_policy = data.get('max_memory_policy') as string | null;

		if (!name || !environment || !tier || !size) {
			return { success: false, error: 'All fields are required' };
		}

		const res = await mutation.mutate(
			{
				input: {
					name: name,
					environmentName: environment,
					teamSlug: params.team,
					tier: ValkeyTier[tier as keyof typeof ValkeyTier],
					size: ValkeySize[size as keyof typeof ValkeySize],
					maxMemoryPolicy: !max_memory_policy
						? null
						: ValkeyMaxMemoryPolicy[max_memory_policy as keyof typeof ValkeyMaxMemoryPolicy]
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return {
				success: false,
				error: res.errors![0].message,
				name,
				environment,
				tier,
				size,
				max_memory_policy
			};
		}

		return { success: true };
	}
};
