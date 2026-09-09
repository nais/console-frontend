import { graphql, OpenSearchMajorVersion, OpenSearchMemory, OpenSearchTier } from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation CreateOpenSearch($input: CreateOpenSearchInput!) {
		createOpenSearch(input: $input) {
			openSearch {
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
		const version = data.get('version') as string | null;
		const storage = data.get('storageGB') as string | null;
		const httpMaxContentLength = data.get('http_max_content_length') as string | null;
		const maxClauseCount = data.get('indices_query_bool_max_clause_count') as string | null;
		const shardIndexingPressureEnabled = data.has('shard_indexing_pressure_enabled');
		const shardIndexingPressureEnforced = data.has('shard_indexing_pressure_enforced');

		const allProps = {
			name,
			environment,
			tier,
			memory,
			version,
			storageGB: storage,
			http_max_content_length: httpMaxContentLength,
			indices_query_bool_max_clause_count: maxClauseCount,
			shard_indexing_pressure_enabled: shardIndexingPressureEnabled,
			shard_indexing_pressure_enforced: shardIndexingPressureEnforced
		};

		if (!name || !environment || !tier || !memory || !version || !storage) {
			return fail(400, {
				...allProps,
				success: false,
				error: 'All fields are required'
			});
		}

		const storageGB = parseInt(storage, 10);
		if (isNaN(storageGB)) {
			return fail(400, {
				...allProps,
				success: false,
				error: 'Storage must be a number in GB'
			});
		}

		const indicesQueryBoolMaxClauseCount = maxClauseCount ? Number(maxClauseCount) : null;
		if (
			indicesQueryBoolMaxClauseCount !== null &&
			(!Number.isInteger(indicesQueryBoolMaxClauseCount) ||
				indicesQueryBoolMaxClauseCount < 64 ||
				indicesQueryBoolMaxClauseCount > 4096)
		) {
			return fail(400, {
				...allProps,
				success: false,
				error: 'Boolean query max clause count must be an integer between 64 and 4096'
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					name: name,
					environmentName: environment,
					teamSlug: params.team,
					tier: OpenSearchTier[tier as keyof typeof OpenSearchTier],
					memory: OpenSearchMemory[memory as keyof typeof OpenSearchMemory],
					version: OpenSearchMajorVersion[version as keyof typeof OpenSearchMajorVersion],
					storageGB: storageGB,
					httpMaxContentLength: httpMaxContentLength || null,
					indicesQueryBoolMaxClauseCount,
					shardIndexingPressureEnabled,
					shardIndexingPressureEnforced
				}
			},
			{ event }
		);

		if (res.errors && res.errors.length > 0) {
			return fail(400, {
				...allProps,
				success: false,
				error: res.errors[0].message
			});
		} else if (!res.data) {
			return fail(500, {
				...allProps,
				success: false,
				error: 'Failed to create OpenSearch'
			});
		}

		return redirect(
			303,
			`/team/${params.team}/${res.data.createOpenSearch.openSearch.teamEnvironment.environment.name}/opensearch/${res.data.createOpenSearch.openSearch.name}`
		);
	}
};
