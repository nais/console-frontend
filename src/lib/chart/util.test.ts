import { serviceColor, truncateString } from './util';

describe('chart/util', () => {
	describe('truncateString', () => {
		test('returns string unchanged if shorter than limit', () => {
			expect(truncateString('hello', 10)).toBe('hello');
			expect(truncateString('test', 4)).toBe('test');
		});

		test('returns string unchanged if equal to limit', () => {
			expect(truncateString('hello', 5)).toBe('hello');
		});

		test('truncates string and adds ellipsis if longer than limit', () => {
			expect(truncateString('hello world', 8)).toBe('hello...');
			expect(truncateString('this is a long string', 10)).toBe('this is...');
		});

		test('handles exact boundary case', () => {
			// When num=6, we can fit 3 chars + "..." (total 6)
			expect(truncateString('hello world', 6)).toBe('hel...');
		});

		test('handles minimum truncation length', () => {
			// num=4 means 1 char + "..." (4 total)
			expect(truncateString('hello', 4)).toBe('h...');
		});

		test('handles very short limit', () => {
			expect(truncateString('hello', 3)).toBe('...');
		});

		test('handles empty string', () => {
			expect(truncateString('', 5)).toBe('');
		});

		test('handles single character', () => {
			expect(truncateString('a', 5)).toBe('a');
			expect(truncateString('a', 1)).toBe('a');
		});

		test('preserves special characters', () => {
			expect(truncateString('hello@world.com', 10)).toBe('hello@w...');
			expect(truncateString('test-app-name', 8)).toBe('test-...');
		});
	});

	describe('serviceColor', () => {
		test('returns correct color for Cloud SQL', () => {
			expect(serviceColor('Cloud SQL')).toBe('#B45E5A');
		});

		test('returns correct color for Cloud Storage', () => {
			expect(serviceColor('Cloud Storage')).toBe('#C88B4A');
		});

		test('returns correct color for Compute Engine', () => {
			expect(serviceColor('Compute Engine')).toBe('#D6C36E');
		});

		test('returns correct color for BigQuery', () => {
			expect(serviceColor('BigQuery')).toBe('#6CA6CD');
		});

		test('returns correct color for Kubernetes Engine', () => {
			expect(serviceColor('Kubernetes Engine')).toBe('#B76D9A');
		});

		test('returns correct color for Redis', () => {
			expect(serviceColor('Redis')).toBe('#A4C88F');
		});

		test('returns correct color for OpenSearch', () => {
			expect(serviceColor('OpenSearch')).toBe('#A18BC6');
		});

		test('returns correct color for Valkey', () => {
			expect(serviceColor('Valkey')).toBe('#BA8FC1');
		});

		test('returns correct color for Kafka Shared', () => {
			expect(serviceColor('Kafka Shared')).toBe('#7BAF7A');
		});

		test('returns correct color for Kafka Tiered Storage', () => {
			expect(serviceColor('Kafka Tiered Storage')).toBe('#7BC2B5');
		});

		test('returns muted blue for unknown service', () => {
			expect(serviceColor('Unknown Service')).toBe('#689FD3');
		});

		test('returns muted blue for empty string', () => {
			expect(serviceColor('')).toBe('#689FD3');
		});

		test('all colors are valid hex codes', () => {
			const services = [
				'Cloud SQL',
				'Cloud Storage',
				'Compute Engine',
				'BigQuery',
				'Redis',
				'OpenSearch',
				'Valkey',
				'Kafka Shared'
			];

			services.forEach((service) => {
				const color = serviceColor(service);
				expect(color).toMatch(/^#[0-9A-F]{6}$/i);
			});
		});

		test('different services have different colors', () => {
			const color1 = serviceColor('Cloud SQL');
			const color2 = serviceColor('BigQuery');
			const color3 = serviceColor('Redis');

			expect(color1).not.toBe(color2);
			expect(color2).not.toBe(color3);
			expect(color1).not.toBe(color3);
		});

		test('handles case-sensitive service names', () => {
			// Service names are case-sensitive
			expect(serviceColor('cloud sql')).toBe('#689FD3'); // default muted blue
			expect(serviceColor('Cloud SQL')).toBe('#B45E5A'); // correct color
		});
	});
});
