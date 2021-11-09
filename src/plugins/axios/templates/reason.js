import { apis, endpoints } from '../axios'

const getReasonMaintenances = () => apis.get(endpoints.reason.getReason)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getReasonMaintenancesList = () => apis.get(endpoints.reason.getReasonList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const setReasonMaintenances = (obj) => apis.post(endpoints.reason.getReason, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteReasonMaintenances = (id) => apis.delete(endpoints.reason.saveReason(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const updateReasonMaintenances = (id, obj) => apis.put(endpoints.reason.saveReason(id), obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })


export {
	getReasonMaintenances,
	setReasonMaintenances,
	deleteReasonMaintenances,
	updateReasonMaintenances,
	getReasonMaintenancesList,
}
