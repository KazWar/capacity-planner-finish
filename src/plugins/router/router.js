import VueRouter from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

// Importing compiled routes
import { routes } from './routes'

const options = {
	mode:'history',
	routes
}

export const router = new VueRouter(options)
