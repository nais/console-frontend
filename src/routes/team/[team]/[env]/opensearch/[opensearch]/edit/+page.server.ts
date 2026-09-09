import {
	graphql,
	OpenSearchMajorVersion,
	type OpenSearchMajorVersion$options,
	OpenSearchMemory,
	type OpenSearchMemory$options,
	OpenSearchTier,
	type OpenSearchTier$options
} from '$houdini';
import type { ResourceLabelInput } from '$houdini/graphql/inputs';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation UpdateOpenSearch($input: UpdateOpenSearchInput!) {
		updateOpenSearch(input: $input) {
			openSearch {
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const tier = data.get('tier') as OpenSearchTier$options | null;
		const memory = data.get('memory') as OpenSearchMemory$options | null;
		const version = data.get('version') as OpenSearchMajorVersion$options | null;
		const storage = data.get('storageGB') as string | null;
		const labelsJson = data.get('labels') as string | null;
		const httpMaxContentLength = data.get('http_max_content_length') as string | null;
		const maxClauseCount = data.get('indices_query_bool_max_clause_count') as string | null;
		const shardIndexingPressureEnabled = data.has('shard_indexing_pressure_enabled');
		const shardIndexingPressureEnforced = data.has('shard_indexing_pressure_enforced');

		const allProps = {
			tier,
			memory,
			version,
			storageGB: storage,
			http_max_content_length: httpMaxContentLength,
			indices_query_bool_max_clause_count: maxClauseCount,
			shard_indexing_pressure_enabled: shardIndexingPressureEnabled,
			shard_indexing_pressure_enforced: shardIndexingPressureEnforced
		};

		if (!tier || !memory || !version || !storage) {
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
				error: 'Storage capacity must be a number in GB'
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

		let labels: ResourceLabelInput[] | undefined = undefined;
		if (labelsJson) {
			try {
				labels = JSON.parse(labelsJson) as ResourceLabelInput[];
				if (!Array.isArray(labels)) {
					return fail(400, {
						...allProps,
						success: false,
						error: 'Labels must be an array'
					});
				}
				for (const label of labels) {
					if (typeof label.key !== 'string' || typeof label.value !== 'string') {
						return fail(400, {
							...allProps,
							success: false,
							error: 'Each label must have a string key and value'
						});
					}
				}
			} catch {
				return fail(400, {
					...allProps,
					success: false,
					error: 'Invalid labels payload'
				});
			}
		}

		const res = await mutation.mutate(
			{
				input: {
					name: params.opensearch,
					environmentName: params.env,
					teamSlug: params.team,
					tier: OpenSearchTier[tier as keyof typeof OpenSearchTier],
					memory: OpenSearchMemory[memory as keyof typeof OpenSearchMemory],
					version: OpenSearchMajorVersion[version as keyof typeof OpenSearchMajorVersion],
					storageGB: storageGB,
					httpMaxContentLength: httpMaxContentLength || null,
					indicesQueryBoolMaxClauseCount,
					shardIndexingPressureEnabled,
					shardIndexingPressureEnforced,
					labels
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
				error: 'Failed to update OpenSearch'
			});
		}

		return redirect(303, `/team/${params.team}/${params.env}/opensearch/${params.opensearch}`);
	}
};
