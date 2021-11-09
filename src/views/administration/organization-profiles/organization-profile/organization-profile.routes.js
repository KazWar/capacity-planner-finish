import OrganizationProfile from './organization-profile.vue'

export default[
	{
		name:"profile",
    	path:"/administration/profiles/:id",
		component: OrganizationProfile,
		meta: {
			title: 'Profile',
			type: 'ALL'
		}
	}
]

