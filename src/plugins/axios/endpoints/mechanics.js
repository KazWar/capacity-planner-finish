
export default {
	getList: (id = null) => `Mechanics/getList${id ? '?locationId=' + id : ''}`,
	getMachanics: 'Mechanics/',
	editEquipment: (id) => 'Mechanics/' + id,
	getMechanicByPersonId: (personId) => `Mechanics/getByPersonId?personId=` + personId
}
