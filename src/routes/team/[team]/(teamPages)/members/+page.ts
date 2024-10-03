import {
	TeamMemberOrderField,
	type OrderDirection$options,
	type TeamMemberOrderField$options
} from '$houdini';
import type { TeamMemberOrder } from '$houdini/runtime/generated';
import type { MembersVariables } from './$houdini';

export const _MembersVariables: MembersVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		TeamMemberOrderField.NAME) as TeamMemberOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } as TeamMemberOrder };
};
