import { browser } from '$app/environment';
import type { ClientPlugin } from '$houdini';

export const isUnauthenticated = (errors: { message: string }[] | null) => {
	const unauthenticatedError = 'Valid user required. You are not logged in.';
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
				if (!ignoredNames.includes(ctx.name) && browser && isUnauthenticated(value.errors)) {
					window.location.reload();
				}
				return resolve(ctx);
			}
		};
	};
};
