import { writable } from 'svelte/store';

export const updatesConnectionClosed = writable(new Date());
