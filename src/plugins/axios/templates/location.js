import { apis, endpoints } from '../axios'

const getLocationList = (str = null) => apis.get(endpoints.locations.getLocationList(str))
	.then(response => {
		return localStorage.getItem('applicationType') === 'SB' ? response.data.filter(item => item.locationType !== 'OPSTEL') : response.data
	})
		.catch(err => { throw err })

const getLocationRegionList = () => apis.get(endpoints.locations.getRegionList)
	.then(response => {
		return response.data
	})
		.catch(err => { throw err })

const getLocationTypeList = () => apis.get(endpoints.locations.getLocationTypes)
	.then(response => response.data)
		.catch(err => { throw err })

const setLocationType = (obj) => apis.post(endpoints.locations.getLocationTypes, obj)
	.then(response => response.data)
		.catch(err => { throw err })

const setLocation = (obj) => apis.post(endpoints.locations.saveLocation, {data: obj})
	.then(response => response.data)
		.catch(err => { throw err })

const deleteLocation = (id) => apis.delete(endpoints.locations.getLocationDetail(id))
	.then(response => response.data)
		.catch(err => { throw err })

const getLocationDetail = (id) => apis.get(endpoints.locations.getLocationDetail(id))
	.then(response => response.data)
		.catch(err => { throw err })

const deleteLocationType = (id) => apis.delete(endpoints.locations.getLocationTypesDetail(id))
	.then(response => response.data)
		.catch(err => { throw err })

const updatetLocationTypeList = (id, obj) => apis.put(endpoints.locations.setLocationTypes(id), obj)
	.then(response => response.data)
		.catch(err => { throw err })

const getLocationServiceWindowFeasibility = (id) => apis.get(endpoints.locations.getServiceWindowFeasibility(id))
	.then(response => response.data)
		.catch(err => { throw err })

const getLocationEquipmentFeasibility = (str) => apis.get(endpoints.locations.getEquipmentFeasibility(str))
	.then(response => response.data)
		.catch(err => { throw err })

const getLocationFeasibilityNew = (id) => apis.get(endpoints.locations.getFeasibilityNew(id))
	.then(response => response.data)
		.catch(err => { throw err })

const getLocationFilteredList = (arr = []) => apis.get(endpoints.locations.getFilteredList(arr))
	.then(response => response.data)
		.catch(err => { throw err })

export {
	getLocationList,
	getLocationTypeList,
	getLocationServiceWindowFeasibility,
	getLocationFeasibilityNew,
	getLocationDetail,
	getLocationFilteredList,
	getLocationEquipmentFeasibility,
	setLocationType,
	deleteLocationType,
	deleteLocation,
	setLocation,
	getLocationRegionList,
	updatetLocationTypeList,
}
