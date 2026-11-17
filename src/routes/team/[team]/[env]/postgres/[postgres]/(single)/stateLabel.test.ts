import { stateLabel } from './stateLabel.js';

describe('stateLabel', () => {
	test.each([
		['PROGRESSING', 'Preparing'],
		['AVAILABLE', 'Ready'],
		['DEGRADED', 'Degraded'],
		['UNKNOWN_STATE', 'UNKNOWN_STATE']
	])('maps %s to %s', (state, label) => {
		expect(stateLabel(state)).toBe(label);
	});
});
