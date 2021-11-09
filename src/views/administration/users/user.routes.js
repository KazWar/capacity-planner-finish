import Users from './users.vue'
import User from './user.vue'

export default [
	{
		name:"users",
		path:"/administration/users",
		component: Users,
		meta: {
			title: 'Users Management',
			type: 'ALL'
		}
	},
	{
		name:"user",
		path:"/administration/users/:id?",
		component: User,
		meta: {
		title: 'User management',
			type: 'ALL'
		}
	}
]

