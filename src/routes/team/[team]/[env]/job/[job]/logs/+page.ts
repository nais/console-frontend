import type { AfterLoadEvent } from './$houdini';

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	const name = url.searchParams.get('name');

	if (name) {
		const runNames = new Set(
			data.RunsWithPodNames.naisjob.runs
				.map((run) => run.name)
				.filter((name) => name.includes(name))
		);
		if (runNames.size > 0) {
			return { runNames, unknownName: false };
		}
	}

	return {
		runNames: new Set(
			data.RunsWithPodNames.naisjob.runs.map((run) => run.podNames).flatMap((pod) => pod)
		),
		unknownName: !!name
	};
}
