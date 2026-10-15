import { vi } from 'vitest';
import { branchOperation } from './branchOperation.js';

describe('branchOperation', () => {
	const options = () => ({
		request: vi.fn(async () => ({ data: { accepted: true }, errors: null })),
		accepted: (data: { accepted: boolean }) => data.accepted,
		successMessage: 'Operation accepted.',
		rejectedMessage: 'Operation rejected.',
		refresh: vi.fn(async () => {})
	});

	test('returns success after acceptance and refresh', async () => {
		const input = options();
		expect(await branchOperation(input)).toEqual({ ok: true, message: 'Operation accepted.' });
		expect(input.request).toHaveBeenCalledOnce();
		expect(input.refresh).toHaveBeenCalledOnce();
	});

	test('returns an unknown-outcome warning when a mutation rejects', async () => {
		const input = options();
		input.request.mockRejectedValue(new Error('Disconnected'));
		expect(await branchOperation(input)).toEqual({
			ok: false,
			message: expect.stringContaining('Check branch status before trying again')
		});
		expect(input.refresh).not.toHaveBeenCalled();
	});

	test('preserves acceptance when refresh rejects without repeating the mutation', async () => {
		const input = options();
		input.refresh.mockRejectedValue(new Error('Disconnected'));
		expect(await branchOperation(input)).toEqual({
			ok: true,
			message: expect.stringContaining('Operation accepted. Status could not be refreshed.')
		});
		expect(input.request).toHaveBeenCalledOnce();
	});

	test('surfaces API errors without refreshing', async () => {
		const input = options();
		const result = await branchOperation({
			...input,
			request: async () => ({ data: { accepted: true }, errors: [{ message: 'Not allowed.' }] })
		});
		expect(result).toEqual({ ok: false, message: 'Not allowed.' });
		expect(input.refresh).not.toHaveBeenCalled();
	});

	test.each([null, { accepted: false }])('requires confirmed acceptance: %s', async (data) => {
		const input = options();
		expect(await branchOperation({ ...input, request: async () => ({ data }) })).toEqual({
			ok: false,
			message: 'Operation rejected.'
		});
		expect(input.refresh).not.toHaveBeenCalled();
	});
});
