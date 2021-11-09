
export default {
	getEquipmentList: (id = null) => `Equipment/${id ? 'getList?locationId=' + id : ''}`,
	getEquipmentTypesList: 'EquipmentTypes',
	createEquipment: 'Equipment/',
	editEquipment: (id) => 'Equipment/' + id,
	deleteEquipment: (id) => 'Equipment/' + id,
	createEquipmentType: 'EquipmentTypes/',
	editEquipmentType: (id) => 'EquipmentTypes/' + id,
	deleteEquipmentType: (id) => 'EquipmentTypes/' + id,
	getRegionList: 'Regions',
	getLocationTypes: 'LocationTypes',
	getEquipmentFeasibility: (str) => 'Locations/getEquipmentFeasibility' + str,
	saveLocation: 'Locations/saveLocation',
	getLocationTypesDetail: (id) => 'LocationTypes/' + id,
	getLocationDetail: (id) => 'Locations/' + id,
	getServiceWindowFeasibility: (id) => 'Locations/getServiceWindowFeasibility?id=' + id,
	getFeasibilityNew: (id) => 'Locations/getFeasibilityNew?workOrderId=' + id,
	getFilteredList: (arr) => 'Locations/getFileredList?equipmentTypeIds=%5B' + arr + '%5D'
}
