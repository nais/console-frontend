import { graphql } from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation ResizeApplication($input: UpdateApplicationInput!) {
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

		const min = data.get('min') as string | null;
		const max = data.get('max') as string | null;

		if (!min || !max) {
			return fail(400, {
				success: false,
				error: 'Both minimum and maximum replicas are required',
				min,
				max
			});
		}

		const minVal = parseInt(min, 10);
		const maxVal = parseInt(max, 10);

		if (isNaN(minVal) || isNaN(maxVal)) {
			return fail(400, {
				success: false,
				error: 'Replicas must be valid numbers',
				min,
				max
			});
		}

		if (minVal < 0 || maxVal < 0) {
			return fail(400, {
				success: false,
				error: 'Replicas cannot be negative',
				min,
				max
			});
		}

		if (minVal > maxVal) {
			return fail(400, {
				success: false,
				error: 'Minimum replicas cannot exceed maximum replicas',
				min,
				max
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					teamSlug: params.team,
					environmentName: params.env,
					name: params.app,
					replicas: { min: minVal, max: maxVal }
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: res.errors![0].message,
				min,
				max
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to resize application',
				min,
				max
			});
		}

		return redirect(303, `/team/${params.team}/${params.env}/app/${params.app}`);
	}
};
