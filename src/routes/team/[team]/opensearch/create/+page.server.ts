import { graphql, OpenSearchMajorVersion, OpenSearchSize, OpenSearchTier } from '$houdini';
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
		const size = data.get('size') as string | null;
		const version = data.get('version') as string | null;
		const diskSize = data.get('diskSizeGB') as string | null;

		const allProps = {
			name,
			environment,
			tier,
			size,
			version,
			diskSize
		};

		if (!name || !environment || !tier || !size || !version || !diskSize) {
			return fail(400, {
				...allProps,
				success: false,
				error: 'All fields are required'
			});
		}

		const diskSizeGB = parseInt(diskSize, 10);
		if (isNaN(diskSizeGB)) {
			return fail(400, {
				...allProps,
				success: false,
				error: 'Disk size must be a number in GB'
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					name: name,
					environmentName: environment,
					teamSlug: params.team,
					tier: OpenSearchTier[tier as keyof typeof OpenSearchTier],
					size: OpenSearchSize[size as keyof typeof OpenSearchSize],
					version: OpenSearchMajorVersion[version as keyof typeof OpenSearchMajorVersion],
					diskSizeGB: diskSizeGB
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				...allProps,
				success: false,
				error: res.errors![0].message
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
