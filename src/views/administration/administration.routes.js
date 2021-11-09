import Administration from './administration.vue'

import UserRoutes from './users/user.routes.js'
import OrganizationRoutes from './organizations/organizations.routes.js'
import OrganizationProfilesRoutes from './organization-profiles/organization-profiles.routes.js'

export default [
	{
		name:"administration",
		path:"/administration",
		component: Administration,
		children:[
		],
		meta: {
			title: 'Administration',
			type: 'ALL'
		}
	},

	...UserRoutes,
	...OrganizationRoutes,
	...OrganizationProfilesRoutes
]
