// Importing all the routes from the views
import viewRoutes from '@/views'

// Legacy component importing
import WorkOrders from '@/components/page/WorkOrders2.vue'
import ServiceRequestsMBN from '@/components/page/ServiceRequestsMBN.vue'
import UserManagement from '@/components/page/UserManagement.vue'
import Monitor from '@/components/page/Monitor.vue'
import LoginPlaceholder from '@/components/page/LoginPlaceholder.vue'
import Dashboard from '@/components/dashboard/DashboardMain.vue'
import DashboardKnopen from '@/components/dashboard/components/DashboardKnopen.vue'
import DashboardOverzicht from '@/components/dashboard/components/DashboardOverzicht.vue'
import DashboardMaterieel from '@/components/dashboard/components/DashboardMaterieel.vue'

const getInitialRoute = function () {
	let applicationType = localStorage.getItem('applicationType')
	let obj

	if (applicationType === 'SB') {
		obj = {name: 'WorkOrders'}
	} else if (applicationType === 'OB') {
		obj = {name: 'BwoOverzicht'}
	} else if (applicationType === 'DASHBOARD') {
		obj = {name: 'Dashboard'}
	} else {
		obj = {name: 'ServiceRequestsMBN'}
	}

	return obj
}

export const beforeEnterMustBeLoggedIn = function (title, applicationTypes) {
	return (to, from, next) => {
		if (!localStorage.getItem('sessionId') || !applicationTypes.includes(localStorage.getItem('applicationType'))) {
			next({
				name: 'LoginPlaceholder',
				params: {
					message: 'Uw sessie is niet (meer) geldig, gelieve opnieuw in te loggen.'
				}
			})
		}
		else {
			if (!applicationTypes || applicationTypes.includes(localStorage.getItem('applicationType'))) {
				document.title = title + ' - Capaciteitsplanner'
				next()
			}
			else {
				next(getInitialRoute())
			}
		}
		next()
	}
}

export const beforeEnterMustBeLoggedOut = function (title) {
	return (to, from, next) => {
		if (!localStorage.getItem('sessionId')) {
			document.title = title + ' - Capaciteitsplanner'
			next()
		}
		else {
			next(getInitialRoute())
		}
	}
}

const legacyRoutes = [
	{
		canReuse: false,
		path: '/dashboard',
		name: 'Dashboard',
		component: Dashboard,
		beforeEnter: beforeEnterMustBeLoggedIn('Dashboard', ['DASHBOARD', 'ADMIN']),
		children: [
			{
				path: 'overzicht',
				component: DashboardOverzicht
			}, {
				path: 'knopen/:id',
				component: DashboardKnopen
			}, {
				path: 'materieel/:id',
				component: DashboardMaterieel
			}
		]
	},
	{
		canReuse: false,
		path: '/werkorders',
		name: 'WorkOrders',
		component: WorkOrders,
		meta: {
			title: 'Werkorders',
			type: 'SB'
		},
		beforeEnter: beforeEnterMustBeLoggedIn('Werkorders', ['SB', 'ADMIN'])
	},
	{
		path: '/gebruikersbeheer',
		name: 'UserManagement',
		component: UserManagement,
		meta: {
			title: 'Gebruikersbeheer',
			type: 'ADMIN'
		},
		beforeEnter: beforeEnterMustBeLoggedIn('Gebruikersbeheer', ['ADMIN'])
	},

	{
		path: '/service-aanvragen-mbn',
		name: 'ServiceRequestsMBN',
		component: ServiceRequestsMBN,
		meta: {
			title: 'Service aanvragen',
			dynamicTitle: true,
			type: 'MBN'
		},
		beforeEnter: beforeEnterMustBeLoggedIn('Service aanvragen', ['MBN', 'ADMIN'])
	},

	{
		path: '/monitor',
		name: 'Monitor',
		component: Monitor,
		meta: {
			title: 'Monitor',
			type: 'MBN'
		},
		beforeEnter: beforeEnterMustBeLoggedIn('Monitor', ['MBN', 'ADMIN'])
	},
	{
		path: '/login',
		name: 'LoginPlaceholder',
		component: LoginPlaceholder,
		meta: {
			hideNavigation: true
		},
		beforeEnter: beforeEnterMustBeLoggedOut('Inloggen')
	},
	{
		path: '*',
		redirect: '/werkorders'
	},

]

const routesConfig = [
	...legacyRoutes,
	...viewRoutes
]

export const routes = routesConfig

