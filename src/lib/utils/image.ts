export const parseImage = (image?: string) => {
	if (!image) {
		return {};
	}

	const normalizedImage = image.trim();

	if (normalizedImage === '') {
		return {};
	}

	if (/\s/.test(normalizedImage)) {
		throw new Error('Could not parse image reference');
	}

	const digestParts = normalizedImage.split('@');

	if (digestParts.length > 2) {
		throw new Error('Could not parse image reference');
	}

	const withoutDigest = digestParts[0] ?? normalizedImage;
	const digest = digestParts[1];

	if (digest !== undefined) {
		const [algorithm, value, ...rest] = digest.split(':');

		if (!algorithm || !value || rest.length > 0) {
			throw new Error('Could not parse image digest');
		}
	}

	const lastColonIndex = withoutDigest.lastIndexOf(':');
	const lastSlashIndex = withoutDigest.lastIndexOf('/');
	const hasTag = lastColonIndex > lastSlashIndex;
	const imagePath = hasTag ? withoutDigest.slice(0, lastColonIndex) : withoutDigest;
	const tag = hasTag ? withoutDigest.slice(lastColonIndex + 1) : undefined;

	if (hasTag && tag === '') {
		throw new Error('Could not parse image tag');
	}

	const name = imagePath.split('/').pop();
	const registry = imagePath.split('/')[0] ?? '';
	const repository = imagePath.split('/').slice(1, -1).join('/');

	if (name === undefined || name === '') {
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
