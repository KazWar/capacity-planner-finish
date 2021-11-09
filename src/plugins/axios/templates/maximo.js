import { apis, endpoints } from '../axios'

const getMaximoLogs = (date) => apis.get(endpoints.maximo.maximoLogs(date))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getMaximoLogs
}
