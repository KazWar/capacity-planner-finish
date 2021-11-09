
export default {
	getLocationList: (str) => `Locations${str || ''}`,
	getRegionList: 'Regions',
	getLocationTypes: () => 'LocationTypes',
	setLocationTypes: (id) => 'LocationTypes/' + id ,
	getEquipmentFeasibility: (str) => 'Locations/getEquipmentFeasibility' + str,
	saveLocation: 'Locations/saveLocation',
	getLocationTypesDetail: (id) => 'LocationTypes/' + id,
	getLocationDetail: (id) => 'Locations/' + id,
	getServiceWindowFeasibility: (id) => 'Locations/getServiceWindowFeasibility?id=' + id,
	getFeasibilityNew: (id) => 'Locations/getFeasibilityNew?workOrderId=' + id,
	getFilteredList: (arr) => 'Locations/getFileredList?equipmentTypeIds=%5B' + arr + '%5D'
}
