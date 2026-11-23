import { describe, expect, it } from 'vitest';
import {
	backupRetentionError,
	estimateBackupCost,
	parseBackupRetention
} from './backupRetention.js';

describe('backup retention', () => {
	it.each(['', '  ', '2', '7', '30'])('accepts %j', (value) => {
		expect(backupRetentionError(value)).toBeUndefined();
	});

	it.each(['1', '0', '31', '-2', '7.5', 'a', '1e1'])('rejects %j', (value) => {
		expect(backupRetentionError(value)).toContain('between 2 and 30');
	});

	it('parses only valid values', () => {
		expect(parseBackupRetention('14')).toBe(14);
		expect(parseBackupRetention('')).toBeUndefined();
		expect(parseBackupRetention('31')).toBeUndefined();
	});

	it('estimates one base backup per night plus the one before the window', () => {
		expect(estimateBackupCost(10, 2)).toEqual({ storedGiB: 30, eurPerMonth: expect.closeTo(0.6) });
		expect(estimateBackupCost(100, 30).storedGiB).toBe(3100);
	});

	it('grows with window and storage size', () => {
		expect(estimateBackupCost(50, 14).eurPerMonth).toBeGreaterThan(
			estimateBackupCost(50, 7).eurPerMonth
		);
		expect(estimateBackupCost(100, 7).eurPerMonth).toBeGreaterThan(
			estimateBackupCost(50, 7).eurPerMonth
		);
	});
});
