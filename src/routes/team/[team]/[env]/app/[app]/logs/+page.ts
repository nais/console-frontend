import { SvelteSet } from 'svelte/reactivity';
import type { AfterLoadEvent } from './$houdini';

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	const name = url.searchParams.get('name');
	const env = data.Instances.team.environment.name;
	const app = data.Instances.team.environment.application.name;
	if (name) {
		const instanceNames = new SvelteSet(
			data.Instances.team.environment.application.instances.nodes
				.map((instance) => instance.name)
				.filter((instance) => instance.includes(name))
		);
		if (instanceNames.size > 0) {
			return { env, app, instanceNames, unknownName: false };
		}
	}
	return {
		env,
		app,
		instanceNames: new SvelteSet(
			data.Instances.team.environment.application.instances.nodes
				.map((instance) => instance.name)
				.slice(0, 1)
		),
		unknownName: !!name
	};
}
