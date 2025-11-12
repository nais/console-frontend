export function aggregateAndSortCostByDate(
	series:
		| {
				readonly cost: {
					readonly monthly: {
						readonly series: {
							readonly date: Date;
							readonly sum: number;
						}[];
					};
				};
		  }[]
		| undefined
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
