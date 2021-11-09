import Vue from 'vue'
import axios from 'axios'

export const BaseTemplate = new Vue({
	methods: {
		getRequestOptions(url, method, data, params, customHeaders = {}) {
			const headers = {
				...customHeaders,
				'Content-Type': 'application/json'
			}

			return {
				url,
				method,
				data,
				params,
				headers
			}
		},

		handleError(url, method, error) {
			console.error(`Error executing request ${method} ${url}`)

			if (error.response) {
				console.log(error.response.data)
				console.log(error.response.status)
				console.log(error.response.headers)
			}

			throw new Error('Error executing request')
		},

		// Base template for API requests
		//
		async request(url, method, data, params, headers) {
			const options = this.getRequestOptions(url, method, data, params, headers)
			try {
				const response = await axios(options)
				if (response.status === 200) {
					return response.data
				}
			} catch (error) {
				this.handleError(url, method, error)
			}
		}
	}
})
