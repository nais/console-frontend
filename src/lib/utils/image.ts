export const parseImage = (image: string) => {
	const tag = image.split(':')[1];
	const name = image.split(':')[0].split('/').pop();
	const registry = image.split('/')[0];
	const repository = image.split('/').slice(1, -1).join('/');
	if (name === undefined) {
		throw new Error('Could not parse image name');
	}
	return { registry, repository, name, tag };
};

export const getImageDisplayName = (name: string): string => {
	return name.split('/').slice(2).join('/');
};
