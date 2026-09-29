import { load_TenantActivityLog } from '$houdini';
import type { ActivityLogFilter } from '$houdini/graphql/inputs';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { addDays, differenceInCalendarDays, format, isValid, parseISO, subDays } from 'date-fns';
import { formatOslo, parseOslo } from './osloTime';

const maxDays = 30;
const defaultDays = 7;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timestampPattern =
	/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.000)?(?:Z|[+-](?:0\d|1[0-3]):[0-5]\d|[+-]14:00)$/;

function activityLogBound(value: string, upper: boolean): Date {
	const date = parseISO(value);
	if (datePattern.test(value) && isValid(date) && format(date, 'yyyy-MM-dd') === value) {
		const day = upper ? format(addDays(date, 1), 'yyyy-MM-dd') : value;
		return new Date(`${day}T00:00:00.000Z`);
	}
	if (timestampPattern.test(value) && isValid(date)) {
		return new Date(date.getTime() + (upper ? 1000 : 0));
	}
	error(400, 'From and to must be valid dates or RFC 3339 timestamps with seconds.');
}

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const today = formatOslo(new Date()).slice(0, 10);
	const fromParam = event.url.searchParams.get('from');
	const toParam = event.url.searchParams.get('to');
	const from = fromParam ?? format(subDays(parseISO(today), defaultDays - 1), 'yyyy-MM-dd');
	const to = toParam ?? today;

	const fromTime =
		fromParam === null ? parseOslo(`${from}T00:00:00`) : activityLogBound(from, false);
	const toExclusive =
		toParam === null
			? parseOslo(`${format(addDays(parseISO(to), 1), 'yyyy-MM-dd')}T00:00:00`)
			: activityLogBound(to, true);
	if (fromTime.getTime() >= toExclusive.getTime()) {
		error(400, 'From must be on or before to.');
	}
	const fromDay = datePattern.test(from) ? from : formatOslo(fromTime).slice(0, 10);
	const toDay = datePattern.test(to)
		? to
		: formatOslo(new Date(toExclusive.getTime() - 1000)).slice(0, 10);
	const daysBetween = differenceInCalendarDays(parseISO(toDay), parseISO(fromDay));
	if (daysBetween >= maxDays) {
		error(400, `The activity log date range cannot exceed ${maxDays} days.`);
	}

	const activityTypes =
		event.url.searchParams.get('activityTypes')?.split(',').filter(Boolean) || [];
	const resourceTypes =
		event.url.searchParams.get('resourceTypes')?.split(',').filter(Boolean) || [];
	const environments = event.url.searchParams.get('environments')?.split(',').filter(Boolean) || [];

	const rows = 20;

	return {
		dateRange: {
			from: fromTime.toISOString(),
			to: new Date(toExclusive.getTime() - 1000).toISOString(),
			fromInput: formatOslo(fromTime),
			toInput: formatOslo(new Date(toExclusive.getTime() - 1000)),
			todayEnd: `${formatOslo(new Date()).slice(0, 10)}T23:59:59`,
			custom: fromParam !== null || toParam !== null,
			maxDays
		},
		...(await addPageMeta(event, { title: 'Activity Log', pageHeaderTitle: '' })),
		...(await load_TenantActivityLog({
			event,
			blocking: true,
			variables: {
				...(before ? { before, last: rows } : { after: after || undefined, first: rows }),
				filter: {
					activityTypes,
					resourceTypes,
					environments,
					from: fromTime,
					to: toExclusive
				} as ActivityLogFilter
			}
		}))
	};
}
