import { aggregateAndSortCostByDate } from './cost';

describe('aggregateAndSortCostByDate', () => {
	test('data older than a year', () => {
		expect(
			aggregateAndSortCostByDate([
				{
					cost: {
						monthly: {
							series: [
								{
									date: new Date('2023-03-31'),
									sum: 1.0791141986846924
								},
								{
									date: new Date('2023-02-28'),
									sum: 5.376473903656006
								},
								{
									date: new Date('2023-01-31'),
									sum: 5.804701805114746
								},
								{
									date: new Date('2022-12-31'),
									sum: 6.233828544616699
								},
								{
									date: new Date('2022-11-30'),
									sum: 6.265889644622803
								},
								{
									date: new Date('2022-10-31'),
									sum: 6.072781562805176
								},
								{
									date: new Date('2022-09-30'),
									sum: 5.574065208435059
								},
								{
									date: new Date('2022-08-31'),
									sum: 5.734878063201904
								},
								{
									date: new Date('2022-07-31'),
									sum: 5.665862560272217
								},
								{
									date: new Date('2022-06-30'),
									sum: 5.473260879516602
								},
								{
									date: new Date('2022-05-31'),
									sum: 6.002818584442139
								},
								{
									date: new Date('2022-04-30'),
									sum: 6.498013973236084
								}
							]
						}
					}
				}
			])
		).toEqual([]);
	});

	test('only one month of data', () => {
		expect(
			aggregateAndSortCostByDate([
				{
					cost: {
						monthly: {
							series: [
								{
									date: new Date('2025-02-31'),
									sum: 1.0791141986846924
								}
							]
						}
					}
				}
			])
		).toEqual([
			{
				date: new Date('2025-02-31'),
				sum: 1.0791141986846924
			}
		]);
	});

	test('only one month of data for two workloads', () => {
		expect(
			aggregateAndSortCostByDate([
				{
					cost: {
						monthly: {
							series: [
								{
									date: new Date('2025-02-31'),
									sum: 1.02
								}
							]
						}
					}
				},
				{
					cost: {
						monthly: {
							series: [
								{
									date: new Date('2025-02-31'),
									sum: 1.01
								}
							]
						}
					}
				}
			]).at(0)?.sum
		).toBeCloseTo(2.03);
	});

	test('data for one app, a full year', () => {
		expect(
			aggregateAndSortCostByDate([
				{
					cost: {
						monthly: {
							series: [
								{
									date: new Date('2025-02-28'),
									sum: 1
								},
								{
									date: new Date('2025-01-31'),
									sum: 1
								},
								{
									date: new Date('2024-12-31'),
									sum: 1
								},
								{
									date: new Date('2024-11-30'),
									sum: 1
								},
								{
									date: new Date('2024-10-31'),
									sum: 1
								},
								{
									date: new Date('2024-09-30'),
									sum: 1
								},
								{
									date: new Date('2024-08-31'),
									sum: 1
								},
								{
									date: new Date('2024-07-31'),
									sum: 1
								},
								{
									date: new Date('2024-06-30'),
									sum: 1
								},
								{
									date: new Date('2024-05-31'),
									sum: 1
								},
								{
									date: new Date('2024-04-30'),
									sum: 1
								},
								{
									date: new Date('2024-03-31'),
									sum: 1
								}
							]
						}
					}
				},
				{
					cost: {
						monthly: {
							series: [
								{
									date: new Date('2025-02-28'),
									sum: 1
								},
								{
									date: new Date('2025-01-31'),
									sum: 1
								},
								{
									date: new Date('2024-12-31'),
									sum: 1
								},
								{
									date: new Date('2024-11-30'),
									sum: 1
								},
								{
									date: new Date('2024-10-31'),
									sum: 1
								},
								{
									date: new Date('2024-09-30'),
									sum: 1
								},
								{
									date: new Date('2024-08-31'),
									sum: 1
								},
								{
									date: new Date('2024-07-31'),
									sum: 1
								},
								{
									date: new Date('2024-06-30'),
									sum: 1
								},
								{
									date: new Date('2024-05-31'),
									sum: 1
								},
								{
									date: new Date('2024-04-30'),
									sum: 1
								},
								{
									date: new Date('2024-03-31'),
									sum: 1
								}
							]
						}
					}
				}
			])
		).toEqual([
			{ date: new Date('2024-03-31'), sum: 2 },
			{ date: new Date('2024-04-30'), sum: 2 },
			{ date: new Date('2024-05-31'), sum: 2 },
			{ date: new Date('2024-06-30'), sum: 2 },
			{ date: new Date('2024-07-31'), sum: 2 },
			{ date: new Date('2024-08-31'), sum: 2 },
			{ date: new Date('2024-09-30'), sum: 2 },
			{ date: new Date('2024-10-31'), sum: 2 },
			{ date: new Date('2024-11-30'), sum: 2 },
			{ date: new Date('2024-12-31'), sum: 2 },
			{ date: new Date('2025-01-31'), sum: 2 },
			{ date: new Date('2025-02-28'), sum: 2 }
		]);
	});
});
