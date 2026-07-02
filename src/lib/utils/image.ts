export const parseImage = (image?: string) => {
	if (!image) {
		return {};
	}

	const withoutDigest = image.split('@')[0] ?? image;
	const lastColonIndex = withoutDigest.lastIndexOf(':');
	const lastSlashIndex = withoutDigest.lastIndexOf('/');
	const hasTag = lastColonIndex > lastSlashIndex;
	const imagePath = hasTag ? withoutDigest.slice(0, lastColonIndex) : withoutDigest;
	const tag = hasTag ? withoutDigest.slice(lastColonIndex + 1) : undefined;
	const digest = image.includes('@') ? image.split('@')[1] : undefined;
	const name = imagePath.split('/').pop();
	const registry = imagePath.split('/')[0] ?? '';
	const repository = imagePath.split('/').slice(1, -1).join('/');
	if (name === undefined) {
		throw new Error('Could not parse image name');
	}
	return { registry, repository, name, tag, digest };
};

export const formatImageRef = (image: {
	name: string;
	tag?: string | null;
	digest?: string | null;
}) => {
	let ref = image.name;

	if (image.tag) {
		ref += `:${image.tag}`;
	}

	if (image.digest) {
		ref += `@${image.digest}`;
	}

	return ref;
};

export const getImageDisplayName = (name: string): string => {
	return name.split('/').slice(2).join('/');
};
