import { apis, endpoints } from '../axios'

const getInterfaceUsage = (date) => apis.get(endpoints.interfaces.getUsage(date))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getInterfaceUsage
}
