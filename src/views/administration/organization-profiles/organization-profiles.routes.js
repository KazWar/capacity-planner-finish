import OrganizationProfiles from './organization-profiles.vue'
import OrganizationProfile from './organization-profile/organization-profile.routes.js'

export default[
	{
		name:"profiles",
		path:"/administration/profiles",
		component: OrganizationProfiles,
		meta: {
			title: 'Profile Management',
			type: 'ALL'
		}
	},
	...OrganizationProfile
]

