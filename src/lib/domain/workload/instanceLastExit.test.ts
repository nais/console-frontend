import { instanceLastExit } from './instanceLastExit.js';

const noExit = { lastExitReason: null, lastExitCode: null, lastExitTimestamp: null };

test('preserves a zero exit code even without an exit reason', () => {
	expect(instanceLastExit({ ...noExit, lastExitCode: 0 })).toEqual({
		description: 'Code 0',
		timestamp: null
	});
});

test('distinguishes a timestamp-only exit from missing exit data', () => {
	const lastExitTimestamp = new Date('2026-01-01T10:01:00Z');
	expect(instanceLastExit({ ...noExit, lastExitTimestamp })).toEqual({
		description: null,
		timestamp: lastExitTimestamp
	});
	expect(instanceLastExit(noExit)).toBeNull();
});
