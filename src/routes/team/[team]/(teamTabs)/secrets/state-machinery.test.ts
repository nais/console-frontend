import { expect, test } from 'vitest';
import { mergeChanges, type operation, type updateState } from './state-machinery';

const staticSecret = { name: 'static-secret', apps: [], data: [] };
const initialState: updateState = [{
	env: {
		name: 'test-env'
	},
	secrets: [staticSecret]
}];

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

	expect(mergeChanges(initialState, add)).toEqual([{
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
	}]);
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

	expect(mergeChanges(initialState, del)).toEqual([
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
	]);
});

test('edited kv is a no-op', () => {
	const op: operation = {
		type: 'EditedKv',
		data: {
			env: 'test-env',
			secret: 'static-secret',
			key: 'some-key'
		}
	};

	expect(mergeChanges(initialState, op)).toEqual(initialState);
});

test('deleted kv followed by undo deleted kv is a no-op', () => {
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

	const ops: operation[] = [{
		type: 'DeleteKv',
		data: {
			env: 'test-env',
			secret: 'static-secret',
			key: 'some-key',
		}
	}, {
		type: 'UndoDeleteKv',
		data: {
			env: 'test-env',
			secret: 'static-secret',
			key: 'some-key',
			value: 'some-value'
		}
	}];

	expect(ops.reduce(mergeChanges, initialState)).toEqual(initialState);
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

	expect(mergeChanges(initialState, updateKey)).toEqual([
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
	]);
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

	expect(mergeChanges(initialState, updateValue)).toEqual([
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
	]);
})
