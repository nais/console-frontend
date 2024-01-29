import { assert, expect, test } from 'vitest';
import { type edits, editState, mergeChanges, type updateState } from './state-machinery';

const update: updateState = [{
	env: {
		name: "test-env"
	},
	secrets:[]
}]

const changes: edits = [{
	type: "AddSecret",
	data: {
		env: "test-env",
		secret: "test-secret-secret",
	}
}]

test('we can call mergeChanges', () => {
	expect(mergeChanges(update, changes[0])).toEqual(
	{
		env: {
			name: "test-env"
		},
		secrets:[ {name: "test-secret-secret", apps: [], data:[]} ]
	}
	)

})

// test('we can add a secret', () => {
// 	expect(changes.reduce(mergeChanges, update)).toEqual(   {
// 		env: {
// 			name: "test-env"
// 		},
// 		secrets:[
// 			{
// 				name: "test-secret",
// 				apps: [],
// 				data: [{key: "secret", value: "token", editState: undefined}],
// 			},
// 			{
// 				name: "test-secret-secret",
// 				apps: [],
// 				data: [],
// 			}
// 		]
//
// 	})
// })