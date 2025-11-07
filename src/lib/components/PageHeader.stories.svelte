<script module>
	import { envTagVariant } from '$lib/envTagVariant';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './PageHeader.svelte';

	const { Story } = defineMeta({
		component: PageHeader,
		tags: ['autodocs']
	});
</script>

<Story
	name="Manifest"
	asChild
	parameters={{
		sveltekit_experimental: {
			state: {
				page: {
					data: {
						meta: {
							title: 'Manifest',
							tag: { label: 'dev-gcp', variant: envTagVariant('dev-gcp') },
							breakcrumbs: [
								{
									label: 'nais',
									href: '/team/nais'
								},
								{
									label: 'Jobs',
									href: '/team/nais/jobs'
								},
								{
									label: 'slack-teams-notification',
									href: '/team/nais/dev/job/slack-teams-notification'
								}
							]
						}
					}
				}
			}
		}
	}}
>
	<PageHeader />
</Story>

<Story
	name="Job"
	asChild
	parameters={{
		docs: {
			disable: true
		},
		sveltekit_experimental: {
			state: {
				page: {
					data: {
						meta: {
							title: 'slack-teams-notification',
							tag: { label: 'prod-gcp', variant: envTagVariant('prod-gcp') },
							breadcrumbs: [
								{
									label: 'nais',
									href: '/team/nais'
								},
								{
									label: 'Jobs',
									href: '/team/nais/jobs'
								}
							]
						}
					}
				}
			}
		}
	}}
>
	<PageHeader />
</Story>

<Story
	name="Jobs"
	asChild
	parameters={{
		docs: {
			disable: true
		},
		sveltekit_experimental: {
			state: {
				page: {
					data: {
						meta: {
							title: 'Jobs',
							breadcrumbs: [
								{
									label: 'nais',
									href: '/team/nais'
								}
							]
						}
					}
				}
			}
		}
	}}
>
	<PageHeader />
</Story>

<Story
	name="Team"
	parameters={{
		docs: {
			disable: true
		},
		sveltekit_experimental: {
			state: {
				page: {
					data: {
						meta: {
							title: 'nais'
						}
					}
				}
			}
		}
	}}
>
	<PageHeader />
</Story>
