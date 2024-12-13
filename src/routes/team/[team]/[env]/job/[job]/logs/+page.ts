import type { AfterLoadEvent } from './$houdini';

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	const name = url.searchParams.get('name');

	if (name) {
		const selected = data.RunsWithPodNames.team.environment.job.runs.nodes.find(
			(run) => run.name === name
		)?.name;
		if (selected) {
			return { selected: selected, unknownName: false };
		}
	}

	return {
		selected: data.RunsWithPodNames.team.environment.job.runs.nodes.map((run) => run.name)[0]
	};
}
