import { apis, endpoints } from '../axios'

const getPriorityList = () => apis.get(endpoints.priority.getList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deletePriority = (id) => apis.delete(endpoints.priority.deletePriority(id), {})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const setPriority = (obj) => apis.post(endpoints.priority.createPriority, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const updatePriority = (obj) => apis.put(endpoints.priority.savePriority(obj.id), obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getPriorityList,
	deletePriority,
	updatePriority,
	setPriority
}
