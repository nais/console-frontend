import {
	capitalizeFirstLetter,
	euroValueFormatter,
	formatKubernetesCPU,
	formatKubernetesMemory,
	numberFormatter,
	percentageFormatter
} from './formatters';

describe('formatters', () => {
	describe('formatKubernetesMemory', () => {
		test('formats bytes to Kubernetes memory units', () => {
			expect(formatKubernetesMemory(0)).toBe('0B');
			expect(formatKubernetesMemory(512)).toBe('512B');
			expect(formatKubernetesMemory(1024)).toBe('1Ki');
			expect(formatKubernetesMemory(1536)).toBe('2Ki'); // 1.5Ki rounds up to 2Ki
		});

		test('returns whole numbers for exact unit divisions', () => {
			expect(formatKubernetesMemory(1024)).toBe('1Ki'); // 1Ki exactly
			expect(formatKubernetesMemory(1024 * 1024)).toBe('1Mi'); // 1Mi exactly
			expect(formatKubernetesMemory(1024 * 1024 * 1024)).toBe('1Gi'); // 1Gi exactly
			expect(formatKubernetesMemory(3 * 1024 * 1024 * 1024)).toBe('3Gi'); // 3Gi exactly
		});

		test('uses smaller unit for non-whole numbers less than 10', () => {
			expect(formatKubernetesMemory(1.69 * 1024 * 1024 * 1024)).toBe('1731Mi'); // 1.69Gi -> 1731Mi (rounds up)
			expect(formatKubernetesMemory(2.5 * 1024 * 1024 * 1024)).toBe('2560Mi'); // 2.5Gi -> 2560Mi
		});
		test('rounds up for values >= 10', () => {
			expect(formatKubernetesMemory(10.3 * 1024 * 1024 * 1024)).toBe('11Gi');
			expect(formatKubernetesMemory(15.7 * 1024 * 1024)).toBe('16Mi');
		});

		test('handles large values', () => {
			expect(formatKubernetesMemory(1024 * 1024 * 1024 * 1024)).toBe('1Ti');
			expect(formatKubernetesMemory(1024 * 1024 * 1024 * 1024 * 1024)).toBe('1Pi');
			expect(formatKubernetesMemory(1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toBe('1Ei');
		});

		test('real-world examples', () => {
			expect(formatKubernetesMemory(3145728000)).toBe('3000Mi'); // ~3GB
			expect(formatKubernetesMemory(3221225472)).toBe('3Gi'); // 3GB exactly
			expect(formatKubernetesMemory(536870912)).toBe('512Mi'); // 512MB
			expect(formatKubernetesMemory(1073741824)).toBe('1Gi'); // 1GB
		});
	});

	describe('formatKubernetesCPU', () => {
		test('formats values less than 1 as millicores', () => {
			expect(formatKubernetesCPU(0.001)).toBe('1m');
			expect(formatKubernetesCPU(0.1)).toBe('100m');
			expect(formatKubernetesCPU(0.5)).toBe('500m');
			expect(formatKubernetesCPU(0.999)).toBe('999m');
		});

		test('rounds up millicores to nearest integer', () => {
			expect(formatKubernetesCPU(0.0001)).toBe('1m'); // Rounds up from 0.1m
			expect(formatKubernetesCPU(0.2501)).toBe('251m'); // Rounds up
		});

		test('formats values >= 1 as cores', () => {
			expect(formatKubernetesCPU(1)).toBe('1');
			expect(formatKubernetesCPU(1.5)).toBe('1.5');
			expect(formatKubernetesCPU(2)).toBe('2');
			expect(formatKubernetesCPU(4)).toBe('4');
		});

		test('rounds cores to 1 decimal place', () => {
			expect(formatKubernetesCPU(1.01)).toBe('1.1');
			expect(formatKubernetesCPU(1.99)).toBe('2');
			expect(formatKubernetesCPU(2.34)).toBe('2.4');
			expect(formatKubernetesCPU(2.35)).toBe('2.4');
		});
	});

	describe('percentageFormatter', () => {
		test('formats percentages with default 2 decimal places', () => {
			expect(percentageFormatter(50)).toContain('50');
			expect(percentageFormatter(50)).toContain('%');
			expect(percentageFormatter(33.333)).toContain('33,33');
			expect(percentageFormatter(100)).toContain('100');
		});

		test('handles zero', () => {
			expect(percentageFormatter(0)).toBe('0\u00A0%');
		});

		test('handles NaN', () => {
			expect(percentageFormatter(NaN)).toBe('0\u00A0%');
		});

		test('respects custom decimal places', () => {
			expect(percentageFormatter(33.333, 0)).toContain('33');
			expect(percentageFormatter(33.333, 1)).toContain('33,3');
			expect(percentageFormatter(33.333, 3)).toContain('33,333');
		});

		test('formats small percentages', () => {
			expect(percentageFormatter(0.01)).toContain('0,01');
			expect(percentageFormatter(0.001)).toBe('0\u00A0%');
		});
	});

	describe('numberFormatter', () => {
		test('formats numbers with Norwegian locale', () => {
			expect(numberFormatter(1000)).toContain('1');
			expect(numberFormatter(1000)).toContain('000');
			expect(numberFormatter(1000000)).toContain('1');
			expect(numberFormatter(1000000)).toContain('000');
		});

		test('handles decimals with default 2 places', () => {
			expect(numberFormatter(1234.567)).toContain('1');
			expect(numberFormatter(1234.567)).toContain('234,57');
			expect(numberFormatter(0.123)).toBe('0,12');
		});

		test('respects custom decimal places', () => {
			expect(numberFormatter(1234.567, 0)).toContain('1');
			expect(numberFormatter(1234.567, 0)).toContain('235');
			expect(numberFormatter(1234.567, 1)).toContain('234,6');
			expect(numberFormatter(1234.567, 3)).toContain('234,567');
		});

		test('handles NaN', () => {
			expect(numberFormatter(NaN)).toBe('0');
		});

		test('handles zero', () => {
			expect(numberFormatter(0)).toBe('0');
		});
	});

	describe('euroValueFormatter', () => {
		test('formats euro values with Norwegian locale', () => {
			const result100 = euroValueFormatter(100);
			const result1000 = euroValueFormatter(1000);
			expect(result100).toContain('€');
			expect(result100).toContain('100');
			expect(result1000).toContain('€');
			expect(result1000).toContain('1');
		});

		test('handles undefined', () => {
			expect(euroValueFormatter(undefined)).toBe('');
		});

		test('handles zero', () => {
			const result = euroValueFormatter(0);
			expect(result).toContain('€');
			expect(result).toContain('0');
		});

		test('respects custom decimal places', () => {
			const result0 = euroValueFormatter(123.456, { maximumFractionDigits: 0 });
			const result3 = euroValueFormatter(123.456, { maximumFractionDigits: 3 });
			expect(result0).toContain('€');
			expect(result0).toContain('12');
			expect(result3).toContain('€');
			expect(result3).toContain('12');
		});

		test('formats small values', () => {
			const result01 = euroValueFormatter(0.01);
			const result001 = euroValueFormatter(0.001);
			expect(result01).toContain('€');
			expect(result01).toContain('0,01');
			expect(result001).toContain('€');
			expect(result001).toContain('0');
		});
	});

	describe('capitalizeFirstLetter', () => {
		test('capitalizes first letter', () => {
			expect(capitalizeFirstLetter('hello')).toBe('Hello');
			expect(capitalizeFirstLetter('world')).toBe('World');
		});

		test('handles already capitalized strings', () => {
			expect(capitalizeFirstLetter('Hello')).toBe('Hello');
		});

		test('handles single character', () => {
			expect(capitalizeFirstLetter('a')).toBe('A');
		});

		test('handles empty string', () => {
			expect(capitalizeFirstLetter('')).toBe('');
		});

		test('only affects first letter', () => {
			expect(capitalizeFirstLetter('hello world')).toBe('Hello world');
			expect(capitalizeFirstLetter('hELLO')).toBe('HELLO');
		});
	});
});
