import { apis, endpoints } from '../axios'

const getScenariosList = () => apis.get(endpoints.scenarios.getList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getScenariosList
}
