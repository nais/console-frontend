import { graphql } from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation DeletePostgres($input: DeletePostgresInput!) {
		deletePostgres(input: $input) {
			postgresDeleted
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { params, request } = event;
		const data = await request.formData();
		const name = data.get('name') as string | null;
		if (!name) {
			return fail(400, {
				success: false,
				error: 'Name is required',
				name
			});
		}
		if (name !== params.env + '/' + params.postgres) {
			return fail(400, {
				success: false,
				error: 'Name must be exactly ' + params.env + '/' + params.postgres + '.',
				name
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					name: params.postgres,
					environmentName: params.env,
					teamSlug: params.team
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: res.errors![0].message
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to delete Postgres'
			});
		} else if (res.data.deletePostgres?.postgresDeleted !== true) {
			return fail(500, {
				success: false,
				error: 'Failed to delete Postgres'
			});
		}

		return redirect(303, `/team/${params.team}/postgres`);
	}
};
