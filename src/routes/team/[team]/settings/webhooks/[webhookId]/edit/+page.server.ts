import { updateWebhook } from '#lib/domain/webhooks/actions.server.js';
import type { Actions } from './$types';

export const actions = { default: updateWebhook } satisfies Actions;
