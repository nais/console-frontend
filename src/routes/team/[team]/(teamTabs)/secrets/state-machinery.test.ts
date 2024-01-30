import { expect, test } from 'vitest';
import { editState, mergeChanges, type operation, type updateState } from './state-machinery';

const staticSecret = { name: 'static-secret', apps: [], data: [] };
const initialState: updateState = [{
	env: {
		name: 'test-env'
	},
	secrets: [staticSecret]
}];

test('we can call mergeChanges', () => {
	const add: operation = {
		type: 'AddSecret',
		data: {
			env: 'test-env',
			secret: 'test-secret-secret'
		}
	};

	expect(mergeChanges(initialState, add)).toEqual(
		{
			env: {
				name: 'test-env'
			},
			secrets: [staticSecret, { name: 'test-secret-secret', apps: [], data: [] }]
		}
	);
});

test('add secret', () => {
	const changes: operation[] = [{
		type: 'AddSecret',
		data: {
			env: 'test-env',
			secret: 'test-secret-secret'
		}
	}];

	expect(changes.reduce(mergeChanges, initialState)).toEqual({
		env: {
			name: 'test-env'
		},
		secrets: [
			staticSecret,
			{
				name: 'test-secret-secret',
				apps: [],
				data: []
			}
		]
	});
});

test('deleting a non-existent secret is a no-op', () => {
	const del: operation = {
		type: 'DeleteSecret',
		data: {
			env: 'test-env',
			secret: 'test-secret-secret'
		}
	};

	expect([mergeChanges(initialState, del)]).toEqual(initialState);
});

test('delete secret that exists', () => {
	const del: operation = {
		type: 'DeleteSecret',
		data: {
			env: 'test-env',
			secret: 'static-secret'
		}
	};

	expect(mergeChanges(initialState, del)).toEqual({
		env: {
			name: 'test-env'
		},
		secrets: []
	});
});

test('add kv to secret', () => {
	const add: operation = {
		type: 'AddKv',
		data: {
			env: 'test-env',
			secret: 'static-secret',
			key: 'some-key',
			value: 'some-value'
		}
	};

	expect(mergeChanges(initialState, add)).toEqual({
		env: {
			name: 'test-env'
		},
		secrets: [
			{
				name: 'static-secret',
				apps: [],
				data: [
					{
						key: 'some-key',
						value: 'some-value'
					}
				]
			}]
	});
});

test('delete kv from secret', () => {
	const initialState: updateState = [{
		env: {
			name: 'test-env'
		},
		secrets: [
			{
				name: 'static-secret',
				apps: [],
				data: [
					{
						key: 'some-key',
						value: 'some-value',
					}
				]
			}]
	}];

	const del: operation = {
		type: 'DeleteKv',
		data: {
			env: 'test-env',
			secret: 'static-secret',
			key: 'some-key'
		}
	};

	expect(mergeChanges(initialState, del)).toEqual(
		{
			env: {
				name: 'test-env'
			},
			secrets: [
				{
					name: 'static-secret',
					apps: [],
					data: []
				}
			]
		}
	);
});

test('update key for secret', () => {
	const initialState: updateState = [{
		env: {
			name: 'test-env'
		},
		secrets: [
			{
				name: 'static-secret',
				apps: [],
				data: [
					{
						key: 'some-key',
						value: 'some-value',
					}
				]
			}]
	}];

	const updateKey: operation = {
		type: 'UpdateKey',
		data: {
			env: 'test-env',
			secret: 'static-secret',
			key: 'some-new-key',
			oldKey: 'some-key',
		}
	};

	expect(mergeChanges(initialState, updateKey)).toEqual(
		{
			env: {
				name: 'test-env'
			},
			secrets: [
				{
					name: 'static-secret',
					apps: [],
					data: [
						{
							key: 'some-new-key',
							value: 'some-value',
						}
					]
				}
			]
		}
	);
})

test('update value for secret', () => {
	const initialState: updateState = [{
		env: {
			name: 'test-env'
		},
		secrets: [
			{
				name: 'static-secret',
				apps: [],
				data: [
					{
						key: 'some-key',
						value: 'some-value',
					}
				]
			}]
	}];

	const updateValue: operation = {
		type: 'UpdateValue',
		data: {
			env: 'test-env',
			secret: 'static-secret',
			key: 'some-key',
			value: 'some-new-value',
		}
	};

	expect(mergeChanges(initialState, updateValue)).toEqual(
		{
			env: {
				name: 'test-env'
			},
			secrets: [
				{
					name: 'static-secret',
					apps: [],
					data: [
						{
							key: 'some-key',
							value: 'some-new-value',
						}
					]
				}
			]
		}
	);
})
