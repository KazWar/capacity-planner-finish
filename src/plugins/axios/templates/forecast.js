import { apis, endpoints } from '../axios'

const forecastCalculate = () => apis.get(endpoints.forecast.calculate)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	forecastCalculate
}
