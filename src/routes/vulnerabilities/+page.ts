import {
	load_TenantVulnerabilites,
	TeamOrderField,
	type OrderDirection$options,
	type TeamOrderField$options
} from '$houdini';
import type { PageLoad } from './$types';

const rows = 20;

export const load: PageLoad = async (event) => {
	const field = (event.url.searchParams.get('field') ||
		TeamOrderField.RISK_SCORE) as TeamOrderField$options;
	const direction = (event.url.searchParams.get('direction') || 'DESC') as OrderDirection$options;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	const interval = event.url.searchParams.get('interval') ?? '7d';
	const showByToggle = event.url.searchParams.get('showByToggle') || TeamOrderField.RISK_SCORE;

	const mostVulnerableTeamsDirection =
		showByToggle === TeamOrderField.RISK_SCORE
			? 'DESC'
			: showByToggle === TeamOrderField.CRITICAL_VULNERABILITIES
				? 'DESC'
				: showByToggle === TeamOrderField.SBOM_COVERAGE
					? 'ASC'
					: 'DESC';

	return {
		mostVulnerableTeamsField: showByToggle as TeamOrderField$options,
		mostVulnerableTeamsDirection: mostVulnerableTeamsDirection as OrderDirection$options,
		interval,
		...(await load_TenantVulnerabilites({
			event,
			variables: {
				orderBy: { field: field, direction: direction },
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
};
