import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
	level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
	...(isDevelopment
		? {
				transport: {
					target: 'pino-pretty',
					options: {
						colorize: true
					}
				}
			}
		: {})
});
