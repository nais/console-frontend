import { TeamOrderField, type OrderDirection$options, type TeamOrderField$options } from '$houdini';
import { subDays, subMonths } from 'date-fns';
import type { TenantVulnerabilitesVariables } from './$houdini';

const rows = 20;

export const _TenantVulnerabilitesVariables: TenantVulnerabilitesVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		TeamOrderField.RISK_SCORE) as TeamOrderField$options;
	const direction = (url.searchParams.get('direction') || 'DESC') as OrderDirection$options;

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	const interval = url.searchParams.get('interval') ?? '7d';
	const showByToggle = url.searchParams.get('showByToggle') || TeamOrderField.RISK_SCORE;

	const getFrom = (interval: string): Date => {
		const now = new Date();
		switch (interval) {
			case '6m':
				return subMonths(now, 6);
			case '30d':
				return subDays(now, 30);
			case '7d':
				return subDays(now, 7);
			default:
				return subDays(now, 7);
		}
	};
	const mostVulnerableTeamsDirection =
		showByToggle === TeamOrderField.RISK_SCORE
			? 'DESC'
			: showByToggle === TeamOrderField.CRITICAL_VULNERABILITIES
				? 'DESC'
				: showByToggle === TeamOrderField.SBOM_COVERAGE
					? 'ASC'
					: 'DESC';

	const from = getFrom(interval);

	return {
		orderBy: { field: field, direction: direction },
		...(before ? { before, last: rows } : { after, first: rows }),
		from,
		mostVulnerableTeamsField: showByToggle as TeamOrderField$options,
		mostVulnerableTeamsDirection: mostVulnerableTeamsDirection as OrderDirection$options
	};
};
