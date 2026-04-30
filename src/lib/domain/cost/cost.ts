import { lastDayOfMonth } from 'date-fns';

export interface MonthlyCostSeriesEntry {
	readonly date: Date;
	readonly sum: number;
}

type MonthlyCostCarrier = {
	readonly cost: {
		readonly monthly: {
			readonly series: MonthlyCostSeriesEntry[];
		};
	};
};

export function estimateMonthCost(month: MonthlyCostSeriesEntry): number {
	const daysKnown = month.date.getDate();
	const daysInMonth = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 0).getDate();
	const costPerDay = month.sum / daysKnown;
	return costPerDay * daysInMonth;
}

export function prepareMonthlyCostSeries(
	series: MonthlyCostSeriesEntry[] | undefined
): MonthlyCostSeriesEntry[] {
	if (!series?.length) {
		return [];
	}

	const sortedSeries = [...series].sort((a, b) => a.date.getTime() - b.date.getTime());
	const currentMonth = sortedSeries.at(-1);

	if (!currentMonth) {
		return [];
	}

	const currentMonthEnd = lastDayOfMonth(currentMonth.date);
	if (currentMonth.date.getDate() === currentMonthEnd.getDate()) {
		return sortedSeries;
	}

	const preparedSeries = sortedSeries.slice(0, -1);
	preparedSeries.push({
		date: currentMonthEnd,
		sum: estimateMonthCost(currentMonth)
	});

	return preparedSeries;
}

export function aggregateAndSortCostByDate(
	series: MonthlyCostCarrier[] | undefined
): { date: Date; sum: number }[] {
	const aggregated: Map<string, number> = new Map();
	if (!series) {
		return [];
	}

	const oneYearAgo = new Date();
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

	series.forEach((entry) => {
		entry.cost.monthly.series.forEach(({ date, sum }) => {
			if (date >= oneYearAgo) {
				const dateKey = date.toISOString().split('T')[0];
				aggregated.set(dateKey, (aggregated.get(dateKey) || 0) + sum);
			}
		});
	});

	// Convert to an array and sort by date
	return Array.from(aggregated.entries())
		.map(([dateStr, sum]) => ({ date: new Date(dateStr), sum }))
		.sort((a, b) => a.date.getTime() - b.date.getTime());
}
