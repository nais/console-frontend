import { browser, dev } from '$app/environment';
import { page } from '$app/state';
import amplitude from 'amplitude-js';

const getApiKey = () => {
	if (dev) {
		return '04203d48401492bda4620a74acf85a5b'; // dev
	}
	return '16d1ee2fd894ca2562eeebb5095dbcf0'; // prod
};

const instance = amplitude.getInstance();

type Events = 'pageview' | 'search' | 'suppressFinding' | 'feedback';

export const logEvent = (event: Events, properties?: object) => {
	if (!browser) return;

	const eventDataDefault = {
		routeID: page.route.id,
		domain: window.location.host,
		service: 'nais-console'
	};

	if (dev) console.debug('amplitudeLogEvent', event, properties);

	instance.logEvent(event, { ...eventDataDefault, ...properties });
};

if (browser) {
	instance.init(getApiKey(), undefined, {
		apiEndpoint: 'amplitude.nav.no/collect',
		saveEvents: false,
		includeUtm: true,
		includeReferrer: true,
		trackingOptions: {
			city: false,
			ip_address: false,
			carrier: false
		}
	});
}
