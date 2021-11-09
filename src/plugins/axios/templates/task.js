import { apis, endpoints } from '../axios'

const saveTask = (obj) => apis.post(endpoints.tasks.saveTask, {data: obj})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const createTaskEquipment = (obj) => apis.post(endpoints.tasks.saveEquipmentTask, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteTaskEquipment = (id) => apis.delete(endpoints.tasks.deleteEquipmentTask(id), {})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const createTaskQualification = (obj) => apis.post(endpoints.tasks.createQualificationTask, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteTaskQualification = (id) => apis.post(endpoints.tasks.deleteQualificationTask(id), {})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveQualificationTask = (obj) => apis.post(endpoints.tasks.saveQualificationTask, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	saveTask,
	createTaskEquipment,
	deleteTaskEquipment,
	createTaskQualification,
	saveQualificationTask,
	deleteTaskQualification,
}
