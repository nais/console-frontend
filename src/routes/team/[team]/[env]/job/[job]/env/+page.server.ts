import { graphql } from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation UpdateJobEnv($input: UpdateJobInput!) {
		updateJob(input: $input) {
			job {
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const names = data.getAll('env_name') as string[];
		const values = data.getAll('env_value') as string[];

		const environmentVariables = names
			.map((name, i) => ({ name: name.trim(), value: values[i] ?? '' }))
			.filter((entry) => entry.name.length > 0);

		if (environmentVariables.length === 0) {
			return fail(400, {
				success: false,
				error: 'At least one environment variable is required'
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					teamSlug: params.team,
					environmentName: params.env,
					name: params.job,
					environmentVariables
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
				error: 'Failed to update environment variables'
			});
		}

		return redirect(303, `/team/${params.team}/${params.env}/job/${params.job}`);
	}
};
