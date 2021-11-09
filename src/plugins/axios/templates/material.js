import { apis, endpoints } from '../axios'

const getMaterialList = () => apis.get(endpoints.material.getList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteMaterial = (id) => apis.get(endpoints.material.deleteMaterial(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const createMaterial = (obj) => apis.post(endpoints.material.createMaterial, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const editMaterial = (obj) => apis.put(endpoints.material.saveMaterial(obj.id), obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getMaterialList,
	deleteMaterial,
	createMaterial,
	editMaterial
}
