import { apis, endpoints } from '../axios'

const getMachanics = () => apis.get(endpoints.mechanics.getMachanics)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getMachanicsList = (id = null) => apis.get(endpoints.mechanics.getList(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getMechanicByPersonId = (personId) => apis.get(endpoints.mechanics.getMechanicByPersonId(personId))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getMachanics,
	getMachanicsList,
	getMechanicByPersonId
}
