export type ConfigPermissions = {
	canMutate: boolean;
};

export function getConfigPermissions(viewerIsMember: boolean, isAdmin: boolean): ConfigPermissions {
	return {
		canMutate: viewerIsMember || isAdmin
	};
}
