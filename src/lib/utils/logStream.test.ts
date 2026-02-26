import { describe, expect, it } from 'vitest';
import { appendSortedBoundedLog } from './logStream';

type TestLog = {
	time: string;
	message: string;
};

describe('appendSortedBoundedLog', () => {
	it('appends in-order entries', () => {
		const logs: TestLog[] = [
			{ time: '2026-01-01T10:00:00.000Z', message: 'a' },
			{ time: '2026-01-01T10:00:01.000Z', message: 'b' }
		];

		const result = appendSortedBoundedLog(
			logs,
			{ time: '2026-01-01T10:00:02.000Z', message: 'c' },
			10
		);

		expect(result.map((entry) => entry.message)).toEqual(['a', 'b', 'c']);
	});

	it('inserts out-of-order entries at the right position', () => {
		const logs: TestLog[] = [
			{ time: '2026-01-01T10:00:00.000Z', message: 'a' },
			{ time: '2026-01-01T10:00:02.000Z', message: 'c' }
		];

		const result = appendSortedBoundedLog(
			logs,
			{ time: '2026-01-01T10:00:01.000Z', message: 'b' },
			10
		);

		expect(result.map((entry) => entry.message)).toEqual(['a', 'b', 'c']);
	});

	it('keeps only the latest bounded entries', () => {
		const logs: TestLog[] = [
			{ time: '2026-01-01T10:00:00.000Z', message: 'a' },
			{ time: '2026-01-01T10:00:01.000Z', message: 'b' }
		];

		const result = appendSortedBoundedLog(
			logs,
			{ time: '2026-01-01T10:00:02.000Z', message: 'c' },
			2
		);

		expect(result.map((entry) => entry.message)).toEqual(['b', 'c']);
	});
});
