import { graphql } from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation SetImageVersion($input: UpdateApplicationInput!) {
		updateApplication(input: $input) {
			application {
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const image = data.get('image') as string | null;

		if (!image) {
			return fail(400, {
				success: false,
				error: 'You must select an image version'
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					teamSlug: params.team,
					environmentName: params.env,
					name: params.app,
					image
				}
			},
			{ event }
		);

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, {
				success: false,
				error: res.errors![0].message
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to set image version'
			});
		}

		return redirect(303, `/team/${params.team}/${params.env}/app/${params.app}`);
	}
};
