import { load_TeamOverview } from '$houdini';
import { subWeeks } from 'date-fns';

export async function load(event) {
	return {
		...(await load_TeamOverview({
			event,
			variables: {
				team: event.params.team,
				severitySince: subWeeks(new Date(), 1)
			}
		}))
	};
}
