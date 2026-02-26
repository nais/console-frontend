import { describe, expect, it } from 'vitest';
import { appendSortedBoundedLog } from './logStream';

type TestLog = {
	time: string;
	message: string;
};

describe('appendSortedBoundedLog', () => {
	it('handles empty logs', () => {
		const result = appendSortedBoundedLog(
			[],
			{ time: '2026-01-01T10:00:00.000Z', message: 'a' },
			10
		);

		expect(result.map((entry) => entry.message)).toEqual(['a']);
	});

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

	it('keeps stable ordering for equal timestamps', () => {
		const logs: TestLog[] = [
			{ time: '2026-01-01T10:00:00.000Z', message: 'a' },
			{ time: '2026-01-01T10:00:00.000Z', message: 'b' }
		];

		const result = appendSortedBoundedLog(
			logs,
			{ time: '2026-01-01T10:00:00.000Z', message: 'c' },
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

	it('inserts entries at the beginning when older than all existing logs', () => {
		const logs: TestLog[] = [
			{ time: '2026-01-01T10:00:01.000Z', message: 'b' },
			{ time: '2026-01-01T10:00:02.000Z', message: 'c' }
		];

		const result = appendSortedBoundedLog(
			logs,
			{ time: '2026-01-01T10:00:00.000Z', message: 'a' },
			10
		);

		expect(result.map((entry) => entry.message)).toEqual(['a', 'b', 'c']);
	});

	it('handles invalid timestamp strings by treating them as newest', () => {
		const logs: TestLog[] = [
			{ time: '2026-01-01T10:00:00.000Z', message: 'a' },
			{ time: 'not-a-date', message: 'invalid' }
		];

		const result = appendSortedBoundedLog(
			logs,
			{ time: '2026-01-01T10:00:01.000Z', message: 'b' },
			10
		);

		expect(result.map((entry) => entry.message)).toEqual(['a', 'b', 'invalid']);
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
