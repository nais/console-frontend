type SecretPermissions = {
	canMutate: boolean;
	canRevealValues: boolean;
	canEditValues: boolean;
};

export function getSecretPermissions(viewerIsMember: boolean, isAdmin: boolean): SecretPermissions {
	return {
		canMutate: viewerIsMember || isAdmin,
		canRevealValues: viewerIsMember,
		canEditValues: viewerIsMember
	};
}
