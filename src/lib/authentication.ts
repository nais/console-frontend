import type { ClientPlugin } from '$houdini';
import { writable } from 'svelte/store';

export const isAuthenticated = writable<boolean>(true);

export const isUnauthenticated = (errors: { message: string }[] | null) => {
	const unauthenticatedError = 'Unauthorized';
	if (
		errors &&
		errors.length > 0 &&
		errors.filter((error) => error.message === unauthenticatedError).length > 0
	) {
		return true;
	}
	return false;
};

export const handleMissingLogin = (...ignoredNames: string[]): ClientPlugin => {
	return () => {
		return {
			afterNetwork(ctx, { value, resolve }) {
				if (!ignoredNames.includes(ctx.name) && isUnauthenticated(value.errors)) {
					isAuthenticated.set(false);
				} else if (ctx.name == 'UserInfo' && value.data) {
					if (value.data.me) {
						isAuthenticated.set(true);
					}
				}
				return resolve(ctx);
			}
		};
	};
};
