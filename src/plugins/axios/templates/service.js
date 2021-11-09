import { apis, endpoints } from '../axios'

const serviceChangeStatus = (obj) => apis.post(endpoints.service.changeStatus, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const declineStatus = (id, ids) => apis.post(endpoints.service.changeStatus, {
	id: id,
	declinedStatus: true,
	declinedReason: ids,
	relocateReason: null
})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const undoDeclineStatus = (id, ids) => apis.post(endpoints.service.changeStatus, {
	id: id,
	declinedStatus: false,
	usedLocationIds: ids,
	relocateReason: null
})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveServiceEmplacement = (obj) => apis.post(endpoints.service.saveEmplacement, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const setEmplacementForTask = (obj) => apis.post(endpoints.service.setEmplacementForTask, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const setEmplacementForWorkOrder = (obj) => apis.post(endpoints.service.setEmplacementForWorkOrder, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const unsetEmplacementFromTask = (obj) => apis.post(endpoints.service.unsetEmplacementFromTask, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const unsetEmplacementFromWorkOrder = (obj) => apis.post(endpoints.service.unsetEmplacementFromWorkOrder, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteServiceEmplacement = (obj) => apis.post(endpoints.service.deleteEmplacement, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getServiceWindows = (ids) => apis.get(endpoints.service.getServiceWindows(ids))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })


export {
	serviceChangeStatus,
	saveServiceEmplacement,
	deleteServiceEmplacement,
	getServiceWindows,
	declineStatus,
	undoDeclineStatus,
	setEmplacementForWorkOrder,
	setEmplacementForTask,
	unsetEmplacementFromWorkOrder,
	unsetEmplacementFromTask
}
