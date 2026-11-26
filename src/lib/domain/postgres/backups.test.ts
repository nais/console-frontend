import {
	backupPending,
	backupPhaseLabel,
	backupPhaseTone,
	defaultStandaloneBackupName,
	parseStandaloneBackupRetention,
	standaloneBackupNameError,
	standaloneBackupRetentionError
} from './backups';

describe('standalone Postgres backup helpers', () => {
	test('validates backup names as Kubernetes DNS subdomains', () => {
		expect(standaloneBackupNameError('')).toBe('Backup name is required.');
		expect(standaloneBackupNameError('frogres-dr-20261125')).toBeUndefined();
		expect(standaloneBackupNameError('frogres.snapshot-1')).toBeUndefined();
		expect(standaloneBackupNameError('Uppercase')).toMatch(/lowercase/);
		expect(standaloneBackupNameError('-leading-dash')).toMatch(/lowercase/);
	});

	test('validates standalone retention between 1 and 730 days', () => {
		expect(standaloneBackupRetentionError('')).toBeUndefined();
		expect(standaloneBackupRetentionError('1')).toBeUndefined();
		expect(standaloneBackupRetentionError('730')).toBeUndefined();
		expect(standaloneBackupRetentionError('0')).toMatch(/between 1 and 730/);
		expect(standaloneBackupRetentionError('731')).toMatch(/between 1 and 730/);
		expect(parseStandaloneBackupRetention('30')).toBe(30);
		expect(parseStandaloneBackupRetention('')).toBeUndefined();
	});

	test('builds a valid default backup name from database and UTC timestamp', () => {
		const name = defaultStandaloneBackupName('frogres', new Date('2026-11-25T10:47:00Z'));
		expect(name).toBe('frogres-20261125-1047');
		expect(standaloneBackupNameError(name)).toBeUndefined();
	});

	test('maps backup phases to labels, tones and pending flag', () => {
		expect(backupPhaseTone('COMPLETED')).toBe('success');
		expect(backupPhaseTone('FAILED')).toBe('danger');
		expect(backupPhaseTone('RUNNING')).toBe('warning');
		expect(backupPhaseLabel('PREPARING')).toBe('Preparing');
		expect(backupPhaseLabel('RUNNING')).toBe('Running');
		expect(backupPhaseLabel('COMPLETED')).toBe('Completed');
		expect(backupPhaseLabel('FAILED')).toBe('Failed');
		expect(backupPending('PREPARING')).toBe(true);
		expect(backupPending('RUNNING')).toBe(true);
		expect(backupPending('COMPLETED')).toBe(false);
		expect(backupPending('FAILED')).toBe(false);
	});
});
