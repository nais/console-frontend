import type { AfterLoadEvent } from './$houdini';

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	const name = url.searchParams.get('name');
	if (name) {
		const instanceNames = new Set(
			data.Instances.app.instances
				.map((instance) => instance.name)
				.filter((instance) => instance.includes(name))
		);
		if (instanceNames.size > 0) {
			return { instanceNames, unknownName: false };
		}
	}
	return {
		instanceNames: new Set(
			data.Instances.app.instances.map((instance) => instance.name).slice(0, 1)
		),
		unknownName: !!name
	};
}
