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
