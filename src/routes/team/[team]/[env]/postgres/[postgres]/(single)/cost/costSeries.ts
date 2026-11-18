import type { PostgresCosts$result } from '$houdini';

type Cost = NonNullable<PostgresCosts$result['team']['environment']['postgres']>['cost'];

export function dailyCostData(cost: Cost['daily'], from: Date, to: Date) {
	if (!cost?.series.length) return [];

	const services = [...new Set(cost.series.flatMap((item) => item.services.map((s) => s.service)))];
	const byDate = new Map(cost.series.map((item) => [item.date.toISOString().slice(0, 10), item]));
	const data: { date: Date; [key: string]: Date | number }[] = [];

	for (const date = new Date(from); date <= to; date.setUTCDate(date.getUTCDate() + 1)) {
		const item = byDate.get(date.toISOString().slice(0, 10));
		data.push({
			date: new Date(date),
			...Object.fromEntries(services.map((service) => [service, 0])),
			...Object.fromEntries(item?.services.map((service) => [service.service, service.cost]) ?? [])
		});
	}

	return data;
}

export function monthlyCostData(cost: Cost['monthly']) {
	if (!cost?.series.length) return [];

	const sorted = [...cost.series].sort((a, b) => a.date.getTime() - b.date.getTime());
	const byMonth = new Map(sorted.map((item) => [item.date.toISOString().slice(0, 7), item]));
	const first = sorted.at(0);
	const last = sorted.at(-1);
	if (!first || !last) return [];
	const data: { date: Date; Total: number }[] = [];

	for (
		const date = new Date(Date.UTC(first.date.getUTCFullYear(), first.date.getUTCMonth(), 1));
		date <= last.date;
		date.setUTCMonth(date.getUTCMonth() + 1)
	) {
		const item = byMonth.get(date.toISOString().slice(0, 7));
		data.push({ date: new Date(date), Total: item?.sum ?? 0 });
	}

	return data;
}
