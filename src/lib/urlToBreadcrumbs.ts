const worloadLabels = (workloadType: string) => {
	switch (workloadType) {
		case 'job':
			return {
				pageName: 'Jobs',
				singular: 'job',
				plural: 'jobs'
			};
		case 'app':
			return {
				pageName: 'Applications',
				singular: 'app',
				plural: 'applications'
			};
		default:
			throw new Error(`Unknown workload type: ${workloadType}`);
	}
};

export const urlToBreadcrumbs = (url: string): { label: string; href: string }[] => {
	const split = new URL(url).pathname.split('/');

	if (split.length < 4) {
		return [];
	}

	let res = [{ label: split[2], href: split.slice(0, 3).join('/') }];

	if (split.length === 4) {
		return res;
	}

	const [_0, _1, team, env, workloadType, workload] = split;
	const { pageName, plural, singular } = worloadLabels(workloadType);

	res.push({ label: pageName, href: `/team/${team}/${plural}` });

	if (split.length === 6) {
		return res;
	}

	return [...res, { label: workload, href: `/team/${team}/${env}/${singular}/${workload}` }];
};
