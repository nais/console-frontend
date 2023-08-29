import type { AfterLoadEvent } from './$houdini';

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
	return {
		instanceNames: new Set(
			data.Instances.app.instances.map((instance) => instance.name).slice(0, 1)
		)
	};
}
