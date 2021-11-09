import Vue from 'vue'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import VueAxios from 'vue-axios'
import endpoints from './endpoints'
import env from '@/env'

Vue.use(VueAxios, axios)

const apis = axios.create({
	baseURL: env.apiURL,
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		//'Authorization': localStorage.getItem('sessionId')

		// Temporary fix since i've seem to have broken the login mechanism which sets the token. - kazik
		'Authorization': '5KLA2bblm2Hn35Gl5DYbvfRTofj0AXwjTdpLaQ0LVByATpOWd9VbFbeMEmJPCUwG'
	}
})

apis.interceptors.response.use((res) => {
    return Promise.resolve(res)
}, (error) => {
    if (error.status === 401) {
		localStorage.clear()
		router.push('/login')
		location.reload()
    }
    return Promise.reject(error)
})

axios.defaults.headers.common['Authorization'] = localStorage.getItem('sessionId')

axiosRetry(apis, { retries: 3 })

export {apis, endpoints}





