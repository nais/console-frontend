import { branchStateLabel } from './branchStateLabel.js';

describe('branchStateLabel', () => {
	test.each([
		['PROGRESSING', 'Preparing'],
		['AVAILABLE', 'Ready'],
		['DEGRADED', 'Degraded'],
		['UNKNOWN_STATE', 'UNKNOWN_STATE']
	])('maps %s to %s', (state, label) => {
		expect(branchStateLabel(state)).toBe(label);
	});
});
