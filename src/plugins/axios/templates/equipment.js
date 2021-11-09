import { apis, endpoints } from '../axios'

const getEquipmentList = (id) => apis.get(endpoints.equipment.getEquipmentList(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteEquipment = (id) => apis.delete(endpoints.equipment.deleteEquipment(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const createEquipment = (obj) => apis.post(endpoints.equipment.createEquipment, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveEquipment = (obj) => apis.put(endpoints.equipment.editEquipment(obj.id), obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const createEquipmentType = (obj) => apis.post(endpoints.equipment.createEquipmentType, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveEquipmentType = (obj) => apis.put(endpoints.equipment.editEquipmentType(obj.id), obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteEquipmentType = (id) => apis.delete(endpoints.equipment.deleteEquipmentType(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getEquipmentTypesList = () => apis.get(endpoints.equipment.getEquipmentTypesList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })


export {
	getEquipmentList,
	getEquipmentTypesList,
	deleteEquipment,
	createEquipment,
	saveEquipment,
	deleteEquipmentType,
	createEquipmentType,
	saveEquipmentType,
}
