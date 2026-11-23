import { render } from 'svelte/server';
import ApplicationScalingStatus from './ApplicationScalingStatus.svelte';

test('distinguishes missing autoscaling from autoscaling disabled at zero', async () => {
	const notSetUp = await render(ApplicationScalingStatus, {
		props: { scaling: { minInstances: 1, maxInstances: 1, status: null } }
	});
	const disabled = await render(ApplicationScalingStatus, {
		props: {
			scaling: {
				minInstances: 0,
				maxInstances: 3,
				status: {
					state: 'DISABLED',
					message: 'The application was scaled to zero.',
					currentInstances: 0,
					desiredInstances: 0
				}
			}
		}
	});

	expect(notSetUp.body).toContain('Automatic scaling is not set up');
	expect(notSetUp.body).not.toContain('Autoscaler target');
	expect(disabled.body).toContain('Disabled');
	expect(disabled.body).toContain('The application was scaled to zero.');
	expect(disabled.body).toMatch(/Currently running<\/dt>\s*<dd[^>]*>0<\/dd>/);
	expect(disabled.body).toMatch(/Autoscaler target<\/dt>\s*<dd[^>]*>0<\/dd>/);
});

test('shows the scaling constraint with a Resize link only when available', async () => {
	const scaling = {
		minInstances: 1,
		maxInstances: 3,
		status: {
			state: 'LIMITED_BY_MAXIMUM',
			message: 'The autoscaler cannot scale beyond the maximum of 3 instances.',
			currentInstances: 2,
			desiredInstances: 3
		}
	} as const;
	const resizeHref = '/team/devteam/dev/app/app/resize';
	const member = await render(ApplicationScalingStatus, { props: { scaling, resizeHref } });
	const nonMember = await render(ApplicationScalingStatus, { props: { scaling } });

	expect(member.body).toContain(scaling.status.message);
	expect(member.body).toMatch(/Currently running<\/dt>\s*<dd[^>]*>2<\/dd>/);
	expect(member.body).toMatch(/Autoscaler target<\/dt>\s*<dd[^>]*>3<\/dd>/);
	expect(member.body).toContain(`href="${resizeHref}"`);
	expect(nonMember.body).toContain(scaling.status.message);
	expect(nonMember.body).not.toContain('Review scaling limits');
});
