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

export const urlToBreadcrumbs = ({ pathname }: URL): { label: string; href: string }[] => {
	const split = pathname.split('/');

	if (split.length < 4) {
		return [];
	}

	const [, , team, env, workloadType, workload] = split;

	let res = [{ label: team, href: `/team/${team}` }];

	if (split.length === 4) {
		return res;
	}

	const { pageName, plural, singular } = worloadLabels(workloadType);

	res = [...res, { label: pageName, href: `/team/${team}/${plural}` }];

	if (split.length === 6) {
		return res;
	}

	return [...res, { label: workload, href: `/team/${team}/${env}/${singular}/${workload}` }];
};
