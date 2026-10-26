import { dev } from '$app/env';
import { createRequire } from 'node:module';
import pino from 'pino';

export const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	...(dev && {
		transport: {
			target: createRequire(import.meta.url).resolve('pino-pretty'),
			options: {
				colorize: true
			}
		}
	})
});
