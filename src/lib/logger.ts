import { dev } from '$app/env';
import pino from 'pino';

export const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	...(dev && {
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true
			}
		}
	})
});
