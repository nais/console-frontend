import { ActivityLogActivityType, load_TeamOverview } from '$houdini';

const activityLogFilter = Object.values(ActivityLogActivityType).filter(
	(type) =>
		type !== ActivityLogActivityType.APPLICATION_SCALED &&
		type !== ActivityLogActivityType.DEPLOYMENT
);

export async function load(event) {
	return {
		...(await load_TeamOverview({
			event,
			variables: {
				team: event.params.team,
				activityLogFilter: { activityTypes: activityLogFilter }
			}
		}))
	};
}
